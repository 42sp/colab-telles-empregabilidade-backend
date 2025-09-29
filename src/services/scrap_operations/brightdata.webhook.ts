// BrightDataWebhook.ts
import { Application } from '../../declarations';
import { logger } from '../../logger';
import { Request, Response } from 'express';
import { LinkedinService } from '../linkedin/linkedin.class';
import { mapBrightDataToStudentUpdate } from './linkedin.mapper';
import { BrightDataService } from './brightDataService';

export default function (app: Application) {
  const brightDataService = new BrightDataService(app);
  const linkedinService: LinkedinService = app.service('linkedin') as LinkedinService;

  /**
   * Webhook para receber resultados do BrightData
   */
  app.post('/brightdata/webhook', async (req: Request, res: Response) => {
    logger.info('[BrightDataWebhook] Webhook triggered', { body: req.body });

    try {
      const results = req.body?.results || req.body;
      const studentIdsForWebhook: number[] = req.body?.studentIdsForWebhook || [];

      if (!Array.isArray(results)) {
        logger.warn('[BrightDataWebhook] Invalid payload format', { body: req.body });
        return res.status(400).send({ error: 'Invalid payload: expected array of results' });
      }

      logger.info(`[BrightDataWebhook] Received ${results.length} items`);

      const processedResults: any[] = [];
      const skippedResults: any[] = [];

      for (const r of results) {
        const rawData = r.data ?? r.result ?? r;
        const linkedinUrl = rawData?.input_url || rawData?.url || rawData?.linkedin;
        const studentId = rawData?.studentId;

        if (!linkedinUrl || !studentId) {
          logger.warn('[BrightDataWebhook] Skipping result without linkedin url or studentId', { item: r });
          skippedResults.push(r);
          continue;
        }

        if (studentIdsForWebhook.length > 0 && !studentIdsForWebhook.includes(studentId)) {
          logger.info('[BrightDataWebhook] Skipping result not in allowed studentIds list', { linkedin: linkedinUrl, studentId });
          skippedResults.push(r);
          continue;
        }

        try {
          const updateData = mapBrightDataToStudentUpdate(rawData);

          if (Object.keys(updateData).length === 0) {
            logger.info('[BrightDataWebhook] Nothing to update for student', { linkedin: linkedinUrl });
            skippedResults.push(r);
            continue;
          }

          // Salva diretamente no LinkedinService
          await linkedinService.create({
            studentId,
            company_name: updateData.company_name || '',
            current_position: updateData.current_position || '',
            start_date: updateData.start_date || null,
            is_working: updateData.is_working || false,
            timestamp: rawData.timestamp || new Date().toISOString(),
            data: JSON.stringify(rawData)
          });

          // Atualiza os dados do aluno usando o próprio service do students se tiver, ou knex direto
          const knex = app.get('postgresqlClient');
          await knex('students').where({ id: studentId }).update({
            current_position: updateData.current_position || undefined,
            company_name: updateData.company_name || undefined,
            start_date: updateData.start_date || undefined,
            is_working: updateData.is_working ?? undefined,
            updated_at: new Date()
          });

          processedResults.push({ studentId, linkedin: linkedinUrl });
        } catch (err: any) {
          logger.error('[BrightDataWebhook] Error processing result', { error: err?.message ?? String(err), item: r });
          skippedResults.push(r);
        }
      }

      logger.info('[BrightDataWebhook] Processing completed', {
        processedCount: processedResults.length,
        skippedCount: skippedResults.length
      });

      return res.status(200).send({
        message: 'Webhook processed successfully',
        processedCount: processedResults.length,
        skippedCount: skippedResults.length,
        processedResults,
        skippedResults
      });
    } catch (err: any) {
      logger.error('[BrightDataWebhook] Unexpected error', { error: err?.message ?? String(err) });
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  });

  /**
   * Endpoint para disparar operação BrightData
   */
  app.post('/brightdata/run-operation/:operationId', async (req: Request, res: Response) => {
    const operationId = Number(req.params.operationId);
    if (!operationId) return res.status(400).send({ error: 'Invalid operationId' });

    try {
      const knex = app.get('postgresqlClient');
      const op = await knex('scrap_operations').where({ id: operationId }).first();
      if (!op) return res.status(404).send({ error: 'Operation not found' });

      const result = await brightDataService.runOperation(op);
      return res.status(200).send(result);
    } catch (err: any) {
      logger.error('[BrightDataWebhook] Error running operation', { error: err?.message ?? String(err) });
      return res.status(500).send({ error: 'Failed to run operation' });
    }
  });
}
