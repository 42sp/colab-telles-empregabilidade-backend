import axios from 'axios';
import type { Application } from '../../declarations';
import type { ScrapOperations } from './scrapOperations.schema';
import { logger } from '../../logger';

/**
 * Serviço responsável por disparar scrapers no BrightData e processar resultados
 */
export class BrightDataService {
  private app: Application;
  private apiToken: string;
  private apiBaseUrl: string;
  private linkedinDatasetId: string;
  private datasetId: string;

  constructor(app: Application) {
    this.app = app;
    this.apiToken = process.env.BRIGHTDATA_TOKEN || '';
    this.apiBaseUrl = process.env.BRIGHTDATA_URL || 'https://api.brightdata.com';
    this.linkedinDatasetId = process.env.BRIGHTDATA_LIKEDIN_DATASET_ID || '';
    this.datasetId = process.env.BRIGHTDATA_DATASET_ID || '';
  }

  /**
   * Apenas analisa o banco de dados local de acordo com target_conditions
   */
  public async analyzeTargetConditions(op: ScrapOperations) {
    if (!op.target_conditions || !Array.isArray(op.target_conditions)) {
      logger.warn('[BrightDataService] Operation has no target_conditions or invalid format', {
        operationId: op.id,
      });
      return [];
    }

    const knex = this.app.get('postgresqlClient');

    const filters = op.target_conditions as Array<{ field: string; value: string }>;
    let query = knex('students').select('*');

    for (const f of filters) {
      let value: any = f.value;

      // Conversão automática de booleanos
      const booleanFields = ['working', 'hasDisability'];
      if (booleanFields.includes(f.field)) {
        if (value === 'true' || value === 'Sim') value = true;
        else if (value === 'false' || value === 'Não') value = false;
      }

      logger.debug('[BrightDataService] Applying filter', {
        field: f.field,
        originalValue: f.value,
        parsedValue: value,
      });

      query = query.where(f.field, value);
    }

    const sqlInfo = query.toSQL();
    logger.debug('[BrightDataService] SQL query prepared', {
      sql: sqlInfo.sql,
      bindings: sqlInfo.bindings,
    });

    const dbResults = await query;

    logger.info('[BrightDataService] Local DB analysis completed', {
      operationId: op.id,
      filters,
      count: dbResults.length,
    });

    return dbResults;
  }

  /**
   * Executa um scraper BrightData para uma operação via batch job
   * (Atualmente apenas testa a pesquisa no DB, sem chamar BrightData)
   */
  public async runOperation(op: ScrapOperations) {
    // 1️⃣ Filtrar alunos do banco conforme target_conditions
    const dbResults = await this.analyzeTargetConditions(op);
    if (!dbResults.length) {
      logger.warn('[BrightDataService] No students match target_conditions', { operationId: op.id });
      return [];
    }

    // 2️⃣ Extrair URLs do LinkedIn
    const urls = dbResults
      .map((s: any) => s.linkedin_url)
      .filter(Boolean);

    if (!urls.length) {
      logger.warn('[BrightDataService] No valid LinkedIn URLs found for operation', { operationId: op.id });
      return [];
    }

    // ❌ Comentado: Trigger batch no Bright Data
    /*
    const payload = urls.map(url => ({ url }));
    const collector = process.env.BRIGHTDATA_LIKEDIN_DATASET_ID;
    const endpoint = `${process.env.BRIGHTDATA_URL}/dca/trigger?collector=${collector}`;

    try {
      const startTime = Date.now();
      const res = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${process.env.BRIGHTDATA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });
      const duration = Date.now() - startTime;
      logger.info('[BrightDataService] BrightData batch triggered', {
        operationId: op.id,
        countUrls: urls.length,
        durationMs: duration,
        response: res.data,
      });
      return res.data;
    } catch (err: any) {
      logger.error('[BrightDataService] BrightData batch request failed', {
        operationId: op.id,
        error: err?.message ?? String(err),
        stack: err?.stack,
        countUrls: urls.length,
      });
      throw err;
    }
    */

    // ✅ Por enquanto, apenas retorna os alunos filtrados e URLs
    logger.info('[BrightDataService] Test run: filtered LinkedIn URLs', {
      operationId: op.id,
      urls,
    });

    return urls;
  }

  /**
   * Recupera resultados de dataset no BrightData
   */
  public async getResults(datasetId?: string) {
    const endpoint = `${this.apiBaseUrl}/dca/dataset`;
    try {
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
        params: {
          dataset_id: datasetId || this.datasetId,
        },
      });

      logger.info('[BrightDataService] BrightData dataset fetched', {
        datasetId: datasetId || this.datasetId,
        count: Array.isArray(res.data) ? res.data.length : 'unknown',
      });

      return res.data;
    } catch (err: any) {
      logger.error('[BrightDataService] Failed to fetch dataset', {
        datasetId: datasetId || this.datasetId,
        error: err?.message ?? String(err),
      });
      throw err;
    }
  }
}
