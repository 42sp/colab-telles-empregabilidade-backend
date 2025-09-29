import { Application } from '../../declarations';
import { logger } from '../../logger';
import { Request, Response } from 'express';

export default function (app: Application) {
  app.post('/brightdata/webhook', async (req: Request, res: Response) => {
    logger.info('[BrightDataWebhook] Webhook triggered', { body: req.body });

    try {
      const results = req.body?.results || req.body;

      if (!Array.isArray(results)) {
        logger.warn('[BrightDataWebhook] Invalid payload format', { body: req.body });
        return res.status(400).send({ error: 'Invalid payload: expected array of results' });
      }

      logger.info(`[BrightDataWebhook] Received ${results.length} items`);

      const linkedinService = app.service('linkedin');

      const processedResults: any[] = [];
      const skippedResults: any[] = [];

      for (const r of results) {
        const rawData = r.data ?? r.result ?? r;

        // Verifica se existe id ou url
        if (!rawData.id && !rawData.url && !rawData.input_url) {
          logger.warn('[BrightDataWebhook] Skipping result without id or url', { item: r });
          skippedResults.push(r);
          continue;
        }

        try {
          // Chama o serviço do Linkedin, que vai:
          // - procurar student pelo LinkedIn
          // - atualizar ou inserir dados na tabela linkedin
          // - atualizar campo "working" na tabela students
          const createResult = await linkedinService.create(rawData);

          processedResults.push({ input: r, result: createResult });
          logger.info('[BrightDataWebhook] Successfully processed result', { id: rawData.id, url: rawData.url });
        } catch (err: any) {
          logger.error('[BrightDataWebhook] Failed to process individual result', {
            error: err.message ?? err,
            item: r
          });
          skippedResults.push(r);
        }
      }

      logger.info('[BrightDataWebhook] Webhook processing finished', {
        totalReceived: results.length,
        processed: processedResults.length,
        skipped: skippedResults.length
      });

      res.status(200).send({
        ok: true,
        totalReceived: results.length,
        processed: processedResults.length,
        skipped: skippedResults.length,
        processedResults,
        skippedResults
      });
    } catch (err: any) {
      logger.error('[BrightDataWebhook] Failed to process webhook', {
        error: err.message ?? err,
        body: req.body
      });
      res.status(500).send({ error: 'Failed to process webhook' });
    }
  });
}
