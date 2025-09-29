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

  app.post('/brightdata/webhook', async (req: Request, res: Response) => {
    logger.info('[BrightDataWebhook] Webhook triggered', { body: req.body });

    try {
      const results = req.body?.results || req.body;

      if (!Array.isArray(results)) {
        logger.warn('[BrightDataWebhook] Invalid payload format', { body: req.body });
        return res.status(400).send({ error: 'Invalid payload: expected array of results' });
      }

      const processedResults: any[] = [];
      const skippedResults: any[] = [];
      const knex = app.get('postgresqlClient');

      for (const r of results) {
        const rawData = r.data ?? r.result ?? r;
        const linkedinUrl = rawData?.input_url || rawData?.url || rawData?.linkedin;

        if (!linkedinUrl) {
          logger.warn('[BrightDataWebhook] Skipping result without linkedin url', { item: r });
          skippedResults.push(r);
          continue;
        }

        try {
          const updateData = mapBrightDataToStudentUpdate(rawData);

          // Cria ou atualiza registro na tabela linkedin
          const [linkedinRecord] = await linkedinService.find({ query: { url: linkedinUrl } });
          let studentId: number;

          if (linkedinRecord) {
            studentId = linkedinRecord.studentId;
            // Atualiza dados do linkedin
            await linkedinService.patch(linkedinRecord.id, {
              company_name: updateData.organization || linkedinRecord.company_name,
              current_position: updateData.details || linkedinRecord.current_position,
              start_date: updateData.start_date || linkedinRecord.start_date,
              is_working: updateData.working ?? linkedinRecord.is_working,
              timestamp: rawData.timestamp || new Date().toISOString(),
              data: JSON.stringify(rawData)
            });
          } else {
            // Cria novo registro
            const created = await linkedinService.create({
              url: linkedinUrl,
              company_name: updateData.organization || '',
              current_position: updateData.details || '',
              start_date: updateData.start_date || null,
              is_working: updateData.working || false,
              timestamp: rawData.timestamp || new Date().toISOString(),
              data: JSON.stringify(rawData)
            });
            studentId = created.studentId;
          }

          if (!studentId) {
            logger.warn('[BrightDataWebhook] Skipping: studentId not available after linkedin record creation', { linkedinUrl });
            skippedResults.push(r);
            continue;
          }

          // Atualiza tabela students
          await knex('students').where({ id: studentId }).update({
            company_name: updateData.organization || undefined,
            current_position: updateData.details || undefined,
            start_date: updateData.start_date || undefined,
            is_working: updateData.working ?? undefined,
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
