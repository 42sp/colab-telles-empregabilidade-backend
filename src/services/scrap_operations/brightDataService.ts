import axios from 'axios'
import type { Application } from '../../declarations'
import type { ScrapOperations } from './scrapOperations.schema'
import { logger } from '../../logger'

/**
 * Serviço responsável por disparar scrapers no BrightData e processar resultados
 */
export class BrightDataService {
  private app: Application
  private apiToken: string
  private apiBaseUrl: string
  private linkedinDatasetId: string
  private datasetId: string

  constructor(app: Application) {
    this.app = app
    this.apiToken = process.env.BRIGHTDATA_TOKEN || ''
    this.apiBaseUrl = process.env.BRIGHTDATA_URL || 'https://api.brightdata.com/datasets/v3/trigger'
    this.linkedinDatasetId = process.env.BRIGHTDATA_LIKEDIN_DATASET_ID || ''
    this.datasetId = process.env.BRIGHTDATA_DATASET_ID || ''
  }

  /**
   * Analisa o banco local de acordo com target_conditions
   */
  public async analyzeTargetConditions(op: ScrapOperations) {
    if (!op.target_conditions || !Array.isArray(op.target_conditions)) {
      logger.warn('[BrightDataService] Operation has no target_conditions or invalid format', {
        operationId: op.id
      })
      return []
    }

    const knex = this.app.get('postgresqlClient')
    const filters = op.target_conditions as Array<{ field: string; value: string }>
    let query = knex('students').select('*')

    for (const f of filters) {
      let value: any = f.value

      // Conversão automática de booleanos
      const booleanFields = ['working', 'hasDisability']
      if (booleanFields.includes(f.field)) {
        if (value === 'true' || value === 'Sim') value = true
        else if (value === 'false' || value === 'Não') value = false
      }

      logger.debug('[BrightDataService] Applying filter', {
        field: f.field,
        originalValue: f.value,
        parsedValue: value
      })

      query = query.where(f.field, value)
    }

    const sqlInfo = query.toSQL()
    logger.debug('[BrightDataService] SQL query prepared', {
      sql: sqlInfo.sql,
      bindings: sqlInfo.bindings
    })

    const dbResults = await query

    logger.info('[BrightDataService] Local DB analysis completed', {
      operationId: op.id,
      filters,
      count: dbResults.length
    })

    return dbResults
  }

  /**
   * Executa operação no BrightData via dataset trigger (searchLinkedIn)
   */
  public async runOperation(op: ScrapOperations) {
    const dbResults = await this.analyzeTargetConditions(op)
    
    if (!dbResults.length) {
      logger.warn('[BrightDataService] No students match target_conditions', { operationId: op.id })
      return []
    }

    // Extrair URLs do LinkedIn e normalizar
    const urls = dbResults
      .map((s: any) => s.linkedin)
      .filter(Boolean)
      .map(this.normalizeLinkedinUrl)

    if (!urls.length) {
      logger.warn('[BrightDataService] No valid LinkedIn URLs found for operation', { operationId: op.id })
      return []
    }

    // Payload no formato que o BrightData espera: [ { url: "..." }, ... ]
    const payload = urls.map(url => ({ url }))
    const endpoint = `${this.apiBaseUrl}/datasets/v3/trigger`
    const webhookUrl = process.env.BRIGHTDATA_WEBHOOK_URL

    logger.info('[BrightDataService] Using webhook URL', { webhookUrl });

    logger.info('[BrightDataService] Payload for BrightData trigger', {
      payload,
      params: {
        dataset_id: this.linkedinDatasetId,
        include_errors: true,
        format: 'json',
        uncompressed_webhook: true,
        endpoint: webhookUrl
      }
    })

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

      logger.info('[BrightDataService] BrightData dataset triggered (async)', {
        operationId: op.id,
        countUrls: urls.length,
        response: res.data
      })

      // Registrar snapshot_id retornado no banco
      const snapshotId = res.data.snapshot_id
      if (snapshotId) {
        const knex = this.app.get('postgresqlClient')
        const inserts = dbResults.map(m => ({
          linkedin: m.linkedin,
          snapshot: snapshotId
        }))
        await knex('snapshots').insert(inserts)
      }

      return { message: 'Scraping triggered via dataset. Results will arrive via webhook.', snapshot_id: snapshotId }
    } catch (err: any) {
      logger.error('[BrightDataService] BrightData dataset trigger failed', {
        operationId: op.id,
        error: err?.message ?? String(err)
      })
      throw err
    }
  }

  /**
   * Recupera resultados de dataset no BrightData
   */
  public async getResults(datasetId?: string) {
    const endpoint = `${this.apiBaseUrl}/datasets/v3/results`
    try {
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`
        },
        params: {
          dataset_id: datasetId || this.datasetId,
          format: 'json'
        }
      })

      logger.info('[BrightDataService] BrightData dataset fetched', {
        datasetId: datasetId || this.datasetId,
        count: Array.isArray(res.data) ? res.data.length : 'unknown'
      })

      return res.data
    } catch (err: any) {
      logger.error('[BrightDataService] Failed to fetch dataset', {
        datasetId: datasetId || this.datasetId,
        error: err?.message ?? String(err)
      })
      throw err
    }
  }

  /**
   * Normaliza URLs do LinkedIn para o formato correto
   */
  private normalizeLinkedinUrl(url: string): string {
    if (!url) return ''
    let splited = url.split("https:")
    if (splited[1]) url = splited[1]
    splited = url.split("http:")
    if (splited[1]) url = splited[1]
    splited = url.split("//")
    if (splited[1]) url = splited[1]
    splited = url.split("linkedin.com/")
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
