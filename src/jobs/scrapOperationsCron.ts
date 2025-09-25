import cron from "node-cron";
import { DateTime } from "luxon";
import type { Application } from "../declarations";
import type { ScrapOperations, ScrapOperationsPatch } from "../services/scrap_operations/scrapOperations.schema";
import { logger } from "../logger";
import { BrightDataService } from "../services/scrap_operations/brightDataService";

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
  return [Math.max(0, Math.min(23, hour)), Math.max(0, Math.min(59, minute))];
}

/**
 * Optional: Postgres advisory lock key
 */
const PG_ADVISORY_LOCK_KEY = parseInt(process.env.PG_ADVISORY_LOCK_KEY || "12345678", 10);

export function setupScrapOperationsCron(app: Application) {
  const service = app.service("scrap-operations") as {
    find(params?: any): Promise<ScrapOperations[]>;
    patch(id: number, data: ScrapOperationsPatch, params?: any): Promise<ScrapOperations>;
    get?(id: number, params?: any): Promise<ScrapOperations>;
    emit?(event: string, payload: any): void;
  };

  const knex = app.get("postgresqlClient");

  if (process.env.RUN_CRON === "false") {
    logger.info("[Cron] Disabled by RUN_CRON=false");
    return;
  }

  cron.schedule(
    "* * * * *",
    async () => {
      const now = DateTime.now().setZone(APP_TZ);
      const checkStart = now.startOf("minute");
      const checkEnd = checkStart.plus({ minutes: 1 });

      logger.debug("[Cron] Tick started", {
        interval: `${checkStart.toISO()} - ${checkEnd.toISO()}`
      });

      let hasLock = true;
      try {
        if (process.env.USE_PG_ADVISORY_LOCK === "true" && knex) {
          const raw = await knex.raw("SELECT pg_try_advisory_lock(?) AS ok", [PG_ADVISORY_LOCK_KEY]);
          const ok = raw?.rows?.[0]?.ok ?? raw?.[0]?.ok ?? raw?.rows?.[0]?.pg_try_advisory_lock ?? false;
          hasLock = Boolean(ok);
          if (!hasLock) {
            logger.debug("[Cron] Could not acquire advisory lock, skipping this tick");
            return;
          }
          logger.debug("[Cron] Advisory lock acquired");
        }

        const todayStr = now.toISODate();
        const operations: ScrapOperations[] = await service.find({
          query: {
            status: "Agendado",
            deleted: false,
            scheduled_date: todayStr
          },
          paginate: false,
        });

        logger.info("[Cron] Checking scheduled operations", { count: operations.length });

        const brightDataService = new BrightDataService(app);

        for (const op of operations) {
          if (!op.scheduled_date) {
            logger.warn("[Cron] Skipping operation without scheduled_date", { operationId: op.id });
            continue;
          }

          const [hour, minute] = parseTime(op.scheduled_time);
          const scheduled = DateTime.fromISO(op.scheduled_date, { zone: APP_TZ }).set({
            hour, minute, second: 0, millisecond: 0
          });

          const executionWindowEnd = scheduled.plus({ hours: 1 });

          logger.debug("[Cron] Candidate operation", {
            id: op.id,
            name: op.name,
            scheduled: scheduled.toISO(),
            now: now.toISO(),
            windowEnd: executionWindowEnd.toISO()
          });

          if (now < scheduled) {
            logger.debug("[Cron] Skipping - scheduled time not reached", { id: op.id });
            continue;
          }

          if (now >= executionWindowEnd) {
            logger.warn("[Cron] Skipping - operation expired (missed execution window)", { id: op.id });
            continue;
          }

          logger.info("[Cron] Executing operation", { operationId: op.id, name: op.name });

          try {
            let current = (typeof service.get === "function") ? await service.get(op.id) : op;
            if (current.status !== "Agendado") {
              logger.info("[Cron] Skipping - status changed", { id: op.id, prevStatus: current.status });
              continue;
            }

            const started = await service.patch(
              op.id,
              { status: "Em Execução", started_at: DateTime.utc().toISO() },
              { source: "cronjob" }
            );

            try {
              service.emit?.("patched", { ...(started as any), _source: "cronjob", _user: "system" });
            } catch (emitErr) {
              logger.warn("[Cron] emit(patched) failed for start", { operationId: op.id, error: String(emitErr) });
            }

            await sleep(2000);

            current = (typeof service.get === "function") ? await service.get(op.id) : started;
            if (current.status !== "Em Execução") {
              logger.info("[Cron] Not finishing because status changed", { id: op.id, status: current.status });
              continue;
            }

            // 🔹 Aqui chamamos o BrightDataService
            try {
              const brightDataResults = await brightDataService.runOperation(current as ScrapOperations);

              const finished = await service.patch(
                op.id,
                {
                  status: "Concluído",
                  finished_at: DateTime.utc().toISO(),
                  result: brightDataResults
                },
                { source: "cronjob" }
              );

              try {
                service.emit?.("patched", { ...(finished as any), _source: "cronjob", _user: "system" });
              } catch (emitErr) {
                logger.warn("[Cron] emit(patched) failed for finish", { operationId: op.id, error: String(emitErr) });
              }

              logger.info("[Cron] Operation finished successfully", { operationId: op.id });

            } catch (err: any) {
              logger.error("[Cron] BrightData execution failed", { operationId: op.id, error: err?.message ?? String(err) });

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
            }

          } catch (err: any) {
            logger.error("[Cron] Operation failed", { operationId: op.id, error: err?.message ?? String(err) });
          }
        }
      } catch (err: any) {
        logger.error("[Cron] Failed to fetch scheduled operations", { error: err?.message ?? String(err) });
      } finally {
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
