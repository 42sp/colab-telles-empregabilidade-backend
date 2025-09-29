// BrightDataService.ts
import axios from 'axios'
import type { Application } from '../../declarations'
import type { ScrapOperations } from './scrapOperations.schema'
import { logger } from '../../logger'
import type { Knex } from 'knex'

export class BrightDataService {
  private app: Application
  private apiToken: string
  private apiBaseUrl: string
  private linkedinDatasetId: string
  private chunkSize: number

  constructor(app: Application) {
    this.app = app
    this.apiToken = process.env.BRIGHTDATA_TOKEN || ''
    this.apiBaseUrl = process.env.BRIGHTDATA_URL || 'https://api.brightdata.com/datasets/v3/trigger'
    this.linkedinDatasetId = process.env.BRIGHTDATA_LIKEDIN_DATASET_ID || ''
    this.chunkSize = 10 // 🔑 fixo para enviar de 10 em 10
  }

  public async runOperation(op: ScrapOperations) {
    const knex: Knex = this.app.get('postgresqlClient')

    // 🔑 Busca todos os estudantes com LinkedIn
    const students = await knex('students')
      .select('id', 'linkedin')
      .whereNotNull('linkedin')
      .andWhere('linkedin', '<>', '')

    if (!students.length) {
      logger.warn('[BrightDataService] Nenhum estudante com LinkedIn encontrado', { operationId: op.id })
      return []
    }

    // 🔑 Normaliza URLs
    const validStudents = students.map(s => ({
      id: s.id,
      linkedin: s.linkedin,
      normalizedUrl: this.normalizeLinkedinUrl(s.linkedin)
    }))

    // 🔑 Divide em chunks de 10
    const chunks: typeof validStudents[] = []
    for (let i = 0; i < validStudents.length; i += this.chunkSize) {
      chunks.push(validStudents.slice(i, i + this.chunkSize))
    }

    logger.info('[BrightDataService] Estudantes divididos em chunks', {
      operationId: op.id,
      total: validStudents.length,
      chunkSize: this.chunkSize,
      chunks: chunks.length
    })

    const allSnapshotIds: string[] = []

    for (const [index, chunk] of chunks.entries()) {
      const payload = chunk.map(s => ({ url: s.normalizedUrl }))
      const endpoint = `${this.apiBaseUrl}`
      const webhookUrl = process.env.BRIGHTDATA_WEBHOOK_URL

      logger.info(`[BrightDataService] Disparando BrightData para chunk ${index + 1}/${chunks.length}`, { payload })

      try {
        const res = await axios.post(endpoint, payload, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            dataset_id: this.linkedinDatasetId,
            include_errors: true,
            format: 'json',
            uncompressed_webhook: true,
            endpoint: webhookUrl
          },
          timeout: 60000
        })

        const snapshotId = res.data.snapshot_id
        allSnapshotIds.push(snapshotId)

        // 🔑 Salva vínculo no banco
        await knex('snapshots').insert(
          chunk.map(s => ({
            linkedin: s.linkedin,
            snapshot: snapshotId,
            studentId: s.id,
            operationId: op.id
          }))
        )

        logger.info(`[BrightDataService] Snapshot ${snapshotId} salvo para chunk ${index + 1}`, {
          count: chunk.length
        })
      } catch (err: any) {
        logger.error('[BrightDataService] Falha ao disparar BrightData', {
          operationId: op.id,
          chunk: index + 1,
          error: err?.message ?? String(err)
        })
      }
    }

    return {
      message: 'Scraping disparado via BrightData. Resultados chegarão pelo webhook.',
      snapshot_ids: allSnapshotIds,
      totalStudents: validStudents.length
    }
  }

  private normalizeLinkedinUrl(url: string): string {
    if (!url) return ''
    let splited = url.split('https:')
    if (splited[1]) url = splited[1]
    splited = url.split('http:')
    if (splited[1]) url = splited[1]
    splited = url.split('//')
    if (splited[1]) url = splited[1]
    splited = url.split('linkedin.com/')
    if (splited[1]) url = splited[1]
    splited = url.split('in/')
    if (splited[1]) url = splited[1]
    let index = url.indexOf('?')
    if (index !== -1) url = url.substring(0, index)
    index = url.indexOf('/')
    if (index !== -1) url = url.substring(0, index)
    return `https://www.linkedin.com/in/${url}`
  }
}
