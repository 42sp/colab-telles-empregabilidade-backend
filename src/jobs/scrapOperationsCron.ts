// src/jobs/scrapOperationsCron.ts
import cron from "node-cron";
import type { Application } from "../declarations";
import type { ScrapOperations, ScrapOperationsPatch } from "../services/scrap_operations/scrapOperations.schema";

const APP_TZ = "America/Sao_Paulo";

export function setupScrapOperationsCron(app: Application) {
  const service = app.service("scrap-operations") as {
    find(params?: any): Promise<ScrapOperations[]>;
    patch(id: number, data: ScrapOperationsPatch): Promise<ScrapOperations>;
  };

  // Cronjob rodando a cada minuto
  cron.schedule(
    "* * * * *",
    async () => {
      const now = new Date();

      // Calcula intervalo de 1 minuto
      const checkStart = new Date(now);
      checkStart.setSeconds(0, 0);
      const checkEnd = new Date(checkStart);
      checkEnd.setMinutes(checkEnd.getMinutes() + 1);

      console.log(
        `[Cron] Verificando operações entre ${checkStart.toLocaleTimeString("pt-BR", {
          timeZone: APP_TZ,
        })} e ${checkEnd.toLocaleTimeString("pt-BR", { timeZone: APP_TZ })}`
      );

      try {
        // Busca operações agendadas
        const operations: ScrapOperations[] = await service.find({
          query: { status: "Agendado", deleted: false },
          paginate: false,
        });

        console.log(`[Cron] Encontradas ${operations.length} operações agendadas`);

        for (const op of operations) {
          // Converte scheduled_date para Date de forma robusta
          let scheduledDate: Date;
          try {
            scheduledDate = new Date(op.scheduled_date);
            if (isNaN(scheduledDate.getTime())) {
              throw new Error('Data inválida');
            }
          } catch (error) {
            console.warn(`[Cron] scheduled_date inválido para operação ${op.id}:`, op.scheduled_date);
            continue;
          }

          // Extrai hora e minuto
          const [hour, minute] = op.scheduled_time?.split(":").map(Number) ?? [0, 0];

          // Combina date + time
          const scheduled = new Date(scheduledDate);
          scheduled.setHours(hour, minute, 0, 0);

          // Verifica se operação deve ser executada no intervalo
          if (scheduled >= checkStart && scheduled < checkEnd) {
            console.log(`[Cron] Executando operação ${op.id} (${op.name})`);

            try {
              // Marca como "Em Execução"
              await service.patch(op.id, {
                status: "Em Execução",
                started_at: new Date().toISOString(),
              });

              // === Lógica real da operação ===
              await new Promise((res) => setTimeout(res, 2000)); // Simulação de scrap

              // Marca como "Concluído"
              await service.patch(op.id, {
                status: "Concluído",
                finished_at: new Date().toISOString(),
              });

              console.log(`[Cron] Operação ${op.id} concluída`);
            } catch (err: any) {
              console.error(`[Cron] Erro na operação ${op.id}:`, err);
              await service.patch(op.id, {
                status: "Falha",
                error_message: err.message,
                finished_at: new Date().toISOString(),
              });
            }
          }
        }
      } catch (err: any) {
        console.error("[Cron] Erro ao buscar operações agendadas:", err);
      }
    },
    { timezone: APP_TZ }
  );

  console.log("[Cron] Scheduler iniciado para operações scrap");
}