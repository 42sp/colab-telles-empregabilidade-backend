// BrightDataWebhook.ts
import { Application } from '../../declarations'
import { logger } from '../../logger'
import { Request, Response } from 'express'
import { mapBrightDataToStudentUpdate } from './linkedin.mapper'

export default function (app: Application) {
  app.post('/brightdata/webhook', async (req: Request, res: Response) => {
    logger.info('[BrightDataWebhook] Webhook triggered', { body: req.body })

    try {
      const results = req.body?.results || req.body
      const studentIdsForWebhook: number[] = req.body?.studentIdsForWebhook || []

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
        const studentId = rawData?.studentId

        if (!linkedinUrl || !studentId) {
          logger.warn('[BrightDataWebhook] Skipping result without linkedin url or studentId', { item: r })
          skippedResults.push(r)
          continue
        }

        // Processa apenas IDs válidos
        if (studentIdsForWebhook.length > 0 && !studentIdsForWebhook.includes(studentId)) {
          logger.info('[BrightDataWebhook] Skipping result not in allowed studentIds list', {
            linkedin: linkedinUrl,
            studentId
          })
          skippedResults.push(r)
          continue
        }

        try {
          const updateData = mapBrightDataToStudentUpdate(rawData)
          if (Object.keys(updateData).length === 0) {
            logger.info('[BrightDataWebhook] Nothing to update for student', { linkedin: linkedinUrl })
            skippedResults.push(r)
            continue
          }

          const student = await knex('students').where({ id: studentId }).first()
          if (!student) {
            logger.info('[BrightDataWebhook] Student not found, skipping update', {
              linkedin: linkedinUrl,
              studentId
            })
            skippedResults.push(r)
            continue
          }

          await knex('students').where({ id: studentId }).update(updateData)
          processedResults.push({ linkedin: linkedinUrl, action: 'updated', updateData })

          logger.info('[BrightDataWebhook] Successfully updated student', {
            linkedin: linkedinUrl,
            studentId
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
