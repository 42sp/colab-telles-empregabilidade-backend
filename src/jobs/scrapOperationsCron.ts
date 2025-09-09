import cron from "node-cron";
import type { Application } from "../declarations";
import type { ScrapOperations, ScrapOperationsPatch } from "../services/scrap_operations/scrapOperations.schema";
import { logger } from "../logger";

const APP_TZ = "America/Sao_Paulo";

export function setupScrapOperationsCron(app: Application) {
  const service = app.service("scrap-operations") as {
    find(params?: any): Promise<ScrapOperations[]>;
    patch(id: number, data: ScrapOperationsPatch, params?: any): Promise<ScrapOperations>;
  };

  cron.schedule(
    "* * * * *",
    async () => {
      const now = new Date();

      const checkStart = new Date(now);
      checkStart.setSeconds(0, 0);
      const checkEnd = new Date(checkStart);
      checkEnd.setMinutes(checkEnd.getMinutes() + 1);

      logger.debug("[Cron] Tick started", {
        interval: `${checkStart.toISOString()} - ${checkEnd.toISOString()}`
      })

      try {
        const operations: ScrapOperations[] = await service.find({
          query: { status: "Agendado", deleted: false },
          paginate: false,
        });

        if (operations.length > 0) {
          logger.info("[Cron] Found scheduled operations", {
            count: operations.length
          })
        }

        for (const op of operations) {
          let scheduledDate: Date;
          try {
            scheduledDate = new Date(op.scheduled_date);
            if (isNaN(scheduledDate.getTime())) {
              throw new Error("Data inválida");
            }
          } catch {
            logger.warn("[Cron] Invalid scheduled_date", {
              operationId: op.id,
              value: op.scheduled_date
            })
            continue;
          }

          const [hour, minute] = op.scheduled_time?.split(":").map(Number) ?? [0, 0];
          const scheduled = new Date(scheduledDate);
          scheduled.setHours(hour, minute, 0, 0);

          if (scheduled >= checkStart && scheduled < checkEnd) {
            logger.info("[Cron] Executing operation", {
              operationId: op.id,
              name: op.name
            })

            try {
              await service.patch(
                op.id,
                {
                  status: "Em Execução",
                  started_at: new Date().toISOString(),
                },
                { source: "cronjob" }
              );

              await new Promise((res) => setTimeout(res, 2000)); // simulação

              await service.patch(
                op.id,
                {
                  status: "Concluído",
                  finished_at: new Date().toISOString(),
                },
                { source: "cronjob" }
              );

              logger.info("[Cron] Operation finished", { operationId: op.id })
            } catch (err: any) {
              logger.error("[Cron] Operation failed", {
                operationId: op.id,
                error: err.message
              })

              await service.patch(
                op.id,
                {
                  status: "Falha",
                  error_message: err.message,
                  finished_at: new Date().toISOString(),
                },
                { source: "cronjob" }
              );
            }
          }
        }
      } catch (err: any) {
        logger.error("[Cron] Failed to fetch scheduled operations", {
          error: err.message
        })
      }
    },
    { timezone: APP_TZ }
  );

  logger.info("[Cron] Scheduler started", { timezone: APP_TZ })
}
