import { Application } from '../../declarations'
import { logger } from '../../logger'
import { Request, Response } from 'express'
import { mapBrightDataToStudentUpdate } from './linkedin.mapper'

export default function (app: Application) {
  app.post('/brightdata/webhook', async (req: Request, res: Response) => {
    logger.info('[BrightDataWebhook] Webhook triggered', { body: req.body })

    try {
      const results = req.body?.results || req.body

      if (!Array.isArray(results)) {
        logger.warn('[BrightDataWebhook] Invalid payload format', { body: req.body })
        return res.status(400).send({ error: 'Invalid payload: expected array of results' })
      }

      logger.info(`[BrightDataWebhook] Received ${results.length} items`)

      const knex = app.get('postgresqlClient')

      const processedResults: any[] = []
      const skippedResults: any[] = []

      for (const r of results) {
        const rawData = r.data ?? r.result ?? r

        const linkedinUrl = rawData?.input_url || rawData?.url || rawData?.linkedin
        if (!linkedinUrl) {
          logger.warn('[BrightDataWebhook] Skipping result without linkedin url', { item: r })
          skippedResults.push(r)
          continue
        }

        try {
          // Mapeia os dados do Bright Data → campos da tabela students
          const updateData = mapBrightDataToStudentUpdate(rawData)

          if (Object.keys(updateData).length === 0) {
            logger.info('[BrightDataWebhook] Nothing to update for student', { linkedin: linkedinUrl })
            skippedResults.push(r)
            continue
          }

          // Busca estudante existente
          const student = await knex('students')
            .where({ linkedin: linkedinUrl })
            .first()

          if (!student) {
            logger.info('[BrightDataWebhook] No student found, inserting new', {
              linkedin: linkedinUrl,
              updateData
            })

            await knex('students').insert({
              linkedin: linkedinUrl,
              ...updateData
            })

            processedResults.push({ linkedin: linkedinUrl, action: 'inserted', updateData })
          } else {
            logger.info('[BrightDataWebhook] Updating existing student', {
              linkedin: linkedinUrl,
              updateData
            })

            await knex('students')
              .where({ linkedin: linkedinUrl })
              .update(updateData)

            processedResults.push({ linkedin: linkedinUrl, action: 'updated', updateData })
          }

          logger.info('[BrightDataWebhook] Successfully processed result', {
            linkedin: linkedinUrl,
            operation_id: r.operation_id
          })
        } catch (err: any) {
          logger.error('[BrightDataWebhook] Failed to process individual result', {
            error: err.message ?? err,
            item: r
          })
          skippedResults.push(r)
        }
      }

      logger.info('[BrightDataWebhook] Webhook processing finished', {
        totalReceived: results.length,
        processed: processedResults.length,
        skipped: skippedResults.length
      })

      res.status(200).send({
        ok: true,
        totalReceived: results.length,
        processed: processedResults.length,
        skipped: skippedResults.length
      })
    } catch (err: any) {
      logger.error('[BrightDataWebhook] Failed to process webhook', {
        error: err.message ?? err,
        body: req.body
      })
      res.status(500).send({ error: 'Failed to process webhook' })
    }
  })
}
