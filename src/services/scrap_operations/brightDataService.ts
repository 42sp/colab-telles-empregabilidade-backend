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
    this.apiBaseUrl = process.env.BRIGHTDATA_URL || 'https://api.brightdata.com'
    this.linkedinDatasetId = process.env.BRIGHTDATA_LIKEDIN_DATASET_ID || ''
    this.datasetId = process.env.BRIGHTDATA_DATASET_ID || ''
  }

  /**
   * Apenas analisa o banco de dados local de acordo com target_conditions
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
   * Executa um scraper BrightData para uma operação via batch job
   * (Atualmente apenas testa a pesquisa no DB, sem chamar BrightData)
   */
  public async runOperation(op: ScrapOperations) {
    // 1️⃣ Filtrar alunos
    const dbResults = await this.analyzeTargetConditions(op)
    if (!dbResults.length) {
      logger.warn('[BrightDataService] No students match target_conditions', { operationId: op.id })
      return []
    }

    // 2️⃣ Extrair URLs do LinkedIn
    const urls = dbResults.map((s: any) => s.linkedin).filter(Boolean)
    if (!urls.length) {
      logger.warn('[BrightDataService] No valid LinkedIn URLs found for operation', { operationId: op.id })
      return []
    }

    // 3️⃣ Payload para Bright Data
    const payload = urls.map(url => ({ url }))
    const collector = this.linkedinDatasetId
    const endpoint = `${this.apiBaseUrl}/dca/trigger?collector=${collector}`

    // Webhook configurado no .env
    const webhookUrl = process.env.BRIGHTDATA_WEBHOOK_URL

    try {
      const res = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          // 🔗 o Bright Data vai chamar esse endpoint quando terminar
          webhook: webhookUrl,
          format: 'json',
          uncompressed_webhook: true
        },
        timeout: 60000
      })

      logger.info('[BrightDataService] BrightData batch triggered (async)', {
        operationId: op.id,
        countUrls: urls.length,
        response: res.data
      })

      return { message: 'Scraping triggered. Results will arrive via webhook.' }
    } catch (err: any) {
      logger.error('[BrightDataService] BrightData trigger failed', {
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
    const endpoint = `${this.apiBaseUrl}/dca/dataset`
    try {
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`
        },
        params: {
          dataset_id: datasetId || this.datasetId
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
}
