import { Application } from '../../declarations';
import { logger } from '../../logger';
import { Request, Response } from 'express';

export default function (app: Application) {
  app.post('/brightdata/webhook', async (req: Request, res: Response) => {
    try {
      const knex = app.get('postgresqlClient');
      const results = req.body; // Bright Data envia array de resultados

      if (!Array.isArray(results)) {
        logger.warn('[BrightDataWebhook] Invalid payload format', { body: req.body });
        return res.status(400).send({ error: 'Invalid payload' });
      }

      for (const r of results) {
        await knex('linkedin')
          .insert({
            operation_id: r.operation_id ?? null, // se você mandar o operationId no payload do trigger
            linkedin_url: r.url,
            raw_data: JSON.stringify(r),
            created_at: new Date(),
          })
          .onConflict(['operation_id', 'linkedin_url'])
          .merge();
      }

      logger.info('[BrightDataWebhook] Results saved', { count: results.length });

      res.send({ ok: true, saved: results.length });
    } catch (err: any) {
      logger.error('[BrightDataWebhook] Failed to save results', {
        error: err?.message ?? String(err),
      });
      res.status(500).send({ error: 'Failed to save results' });
    }
  });
}
