import cron from "node-cron";
import { DateTime } from "luxon";
import type { Application } from "../declarations";
import type { ScrapOperations, ScrapOperationsPatch } from "../services/scrap_operations/scrapOperations.schema";
import { logger } from "../logger";

const APP_TZ = "America/Sao_Paulo";

/**
 * Helper sleep
 */
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Parse safe time string "HH:mm" -> [hour, minute]
 */
function parseTime(time?: string): [number, number] {
  if (!time || typeof time !== "string") return [0, 0];
  const parts = time.split(":").map(Number);
  const hour = Number.isFinite(parts[0]) ? parts[0] : 0;
  const minute = Number.isFinite(parts[1]) ? parts[1] : 0;
  // clamp ranges
  return [Math.max(0, Math.min(23, hour)), Math.max(0, Math.min(59, minute))];
}

/**
 * Opcional: chave de lock para pg_advisory_lock (se usar postgres advisory lock para evitar múltiplas réplicas)
 * Use process.env.USE_PG_ADVISORY_LOCK = 'true' para ativar.
 */
const PG_ADVISORY_LOCK_KEY = parseInt(process.env.PG_ADVISORY_LOCK_KEY || "12345678", 10);

export function setupScrapOperationsCron(app: Application) {
  const service = app.service("scrap-operations") as {
    find(params?: any): Promise<ScrapOperations[]>;
    patch(id: number, data: ScrapOperationsPatch, params?: any): Promise<ScrapOperations>;
    get?(id: number, params?: any): Promise<ScrapOperations>;
    emit?(event: string, payload: any): void;
  };

  // optional: knex client for advisory lock
  const knex = app.get("postgresqlClient");

  // Allow disabling the cron via env (handy in multiple-deploy scenarios)
  if (process.env.RUN_CRON === "false") {
    logger.info("[Cron] Disabled by RUN_CRON=false");
    return;
  }

  cron.schedule(
    "* * * * *",
    async () => {
      const now = DateTime.now().setZone(APP_TZ); // current moment in APP_TZ
      const checkStart = now.startOf("minute");
      const checkEnd = checkStart.plus({ minutes: 1 });

      logger.debug("[Cron] Tick started", {
        interval: `${checkStart.toISO()} - ${checkEnd.toISO()}`
      });

      // Optional: try to acquire a Postgres advisory lock to avoid multiple replicas running this cron at same time
      let hasLock = true;
      try {
        if (process.env.USE_PG_ADVISORY_LOCK === "true" && knex) {
          // knex.raw returns different shapes depending on driver, handle generically
          const raw = await knex.raw("SELECT pg_try_advisory_lock(?) AS ok", [PG_ADVISORY_LOCK_KEY]);
          // Try common shapes:
          const ok = raw?.rows?.[0]?.ok ?? raw?.[0]?.ok ?? raw?.rows?.[0]?.pg_try_advisory_lock ?? false;
          hasLock = Boolean(ok);
          if (!hasLock) {
            logger.debug("[Cron] Could not acquire advisory lock, skipping this tick");
            return;
          }
          logger.debug("[Cron] Advisory lock acquired");
        }

        // Narrow the initial find query to today's date in APP_TZ to reduce scanned rows
        const todayStr = now.toISODate(); // YYYY-MM-DD in APP_TZ
        const operations: ScrapOperations[] = await service.find({
          query: {
            status: "Agendado",
            deleted: false,
            scheduled_date: todayStr
          },
          paginate: false,
        });

        if (operations.length > 0) {
          logger.info("[Cron] Found scheduled operations", { count: operations.length });
        }

        for (const op of operations) {
          // --- compute scheduled datetime in APP_TZ robustly
          // If scheduled_date or scheduled_time is malformed, log and continue
          if (!op.scheduled_date) {
            logger.warn("[Cron] skipping op without scheduled_date", { operationId: op.id });
            continue;
          }

          const [hour, minute] = parseTime(op.scheduled_time);
          const scheduled = DateTime.fromISO(op.scheduled_date, { zone: APP_TZ }).set({
            hour, minute, second: 0, millisecond: 0
          });

          logger.debug("[Cron] candidate", {
            id: op.id,
            name: op.name,
            scheduled: scheduled.toISO(),
            checkStart: checkStart.toISO(),
            checkEnd: checkEnd.toISO()
          });

          // Only execute when scheduled is inside the current minute window
          if (!(scheduled >= checkStart && scheduled < checkEnd)) {
            continue;
          }

          logger.info("[Cron] Executing operation", { operationId: op.id, name: op.name });

          try {
            // Re-read current row to avoid races (someone may have edited status)
            let current = (typeof service.get === "function") ? await service.get(op.id) : op;
            if (current.status !== "Agendado") {
              logger.info("[Cron] Skipping - status changed", { id: op.id, prevStatus: current.status });
              continue;
            }

            // Mark started
            const started = await service.patch(
              op.id,
              {
                status: "Em Execução",
                started_at: DateTime.utc().toISO()
              },
              { source: "cronjob" } // custom param used by your hooks
            );

            // Explicitly emit patched to ensure real-time clients receive it (internal calls may not be auto-published)
            try {
              service.emit?.("patched", { ...(started as any), _source: "cronjob", _user: "system" });
            } catch (emitErr) {
              logger.warn("[Cron] emit(patched) failed for start", { operationId: op.id, error: String(emitErr) });
            }

            // Simulate work (or run your real job here)
            await sleep(2000);

            // check again before finishing (avoid overwriting if someone changed the op)
            current = (typeof service.get === "function") ? await service.get(op.id) : started;
            if (current.status !== "Em Execução") {
              logger.info("[Cron] Not finishing because status changed", { id: op.id, status: current.status });
              continue;
            }

            const finished = await service.patch(
              op.id,
              {
                status: "Concluído",
                finished_at: DateTime.utc().toISO()
              },
              { source: "cronjob" }
            );

            try {
              service.emit?.("patched", { ...(finished as any), _source: "cronjob", _user: "system" });
            } catch (emitErr) {
              logger.warn("[Cron] emit(patched) failed for finish", { operationId: op.id, error: String(emitErr) });
            }

            logger.info("[Cron] Operation finished", { operationId: op.id });
          } catch (err: any) {
            logger.error("[Cron] Operation failed", {
              operationId: op.id,
              error: err?.message ?? String(err)
            });

            try {
              const failed = await service.patch(
                op.id,
                {
                  status: "Falha",
                  error_message: err?.message ?? String(err),
                  finished_at: DateTime.utc().toISO()
                },
                { source: "cronjob" }
              );
              service.emit?.("patched", { ...(failed as any), _source: "cronjob", _user: "system" });
            } catch (err2: any) {
              logger.error("[Cron] Failed to mark operation as Falha", { operationId: op.id, error: err2?.message ?? String(err2) });
            }
          }
        }
      } catch (err: any) {
        logger.error("[Cron] Failed to fetch scheduled operations", { error: err?.message ?? String(err) });
      } finally {
        // release advisory lock if used
        if (process.env.USE_PG_ADVISORY_LOCK === "true" && knex && hasLock) {
          try {
            await knex.raw("SELECT pg_advisory_unlock(?)", [PG_ADVISORY_LOCK_KEY]);
            logger.debug("[Cron] Advisory lock released");
          } catch (unlockErr) {
            logger.warn("[Cron] Failed to release advisory lock", { error: String(unlockErr) });
          }
        }
      }
    },
    { timezone: APP_TZ }
  );

  logger.info("[Cron] Scheduler started", { timezone: APP_TZ });
}
