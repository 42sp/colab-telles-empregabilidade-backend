import { Application } from '../../declarations';
import { logger } from '../../logger';
import { Request, Response } from 'express';

export default function (app: Application) {
  app.post('/brightdata/webhook', async (req: Request, res: Response) => {
    try {
      const knex = app.get('postgresqlClient');
      const results = req.body?.results || req.body; // Bright Data envia { results: [...] } ou array direto

      if (!Array.isArray(results)) {
        logger.warn('[BrightDataWebhook] Invalid payload format', { body: req.body });
        return res.status(400).send({ error: 'Invalid payload' });
      }

      for (const r of results) {
        // r.url agora é a URL original; r.data ou r.result pode ter os dados coletados
        const rawData = r.data ?? r.result ?? r; 

        await knex('linkedin')
          .insert({
            operation_id: r.operation_id ?? null, // operationId enviado no trigger payload
            linkedin_url: r.url,
            raw_data: JSON.stringify(rawData),
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
