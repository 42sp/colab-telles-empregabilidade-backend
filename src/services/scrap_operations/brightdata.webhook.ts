import { Application } from '../../declarations'
import { logger } from '../../logger'
import { Request, Response } from 'express'
import { mapBrightDataToStudentUpdate } from './linkedin.mapper'

export default function (app: Application) {
  app.post('/brightdata/webhook', async (req: Request, res: Response) => {
    logger.info('[BrightDataWebhook] Webhook triggered', { body: req.body })

    try {
      // results é o array de resultados, studentIds é opcional e contém apenas IDs de alunos que tiveram URLs válidas
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
        const studentId = rawData?.studentId  // opcional se você enviar o ID junto no payload

        if (!linkedinUrl) {
          logger.warn('[BrightDataWebhook] Skipping result without linkedin url', { item: r })
          skippedResults.push(r)
          continue
        }

        // Se houver lista de IDs de estudantes válidos, só processa se estiver na lista
        if (studentIdsForWebhook.length > 0 && studentId && !studentIdsForWebhook.includes(studentId)) {
          logger.info('[BrightDataWebhook] Skipping result not in allowed studentIds list', { linkedin: linkedinUrl, studentId })
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

          // Atualiza somente se o aluno já existir
          const student = await knex('students').where({ linkedin: linkedinUrl }).first()
          if (!student) {
            logger.info('[BrightDataWebhook] Student not found, skipping insert (avoids name NOT NULL error)', { linkedin: linkedinUrl })
            skippedResults.push(r)
            continue
          }

          await knex('students').where({ linkedin: linkedinUrl }).update(updateData)
          processedResults.push({ linkedin: linkedinUrl, action: 'updated', updateData })

          logger.info('[BrightDataWebhook] Successfully updated student', {
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
