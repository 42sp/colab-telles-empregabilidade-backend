import axios from "axios";
import type { Application } from "../../declarations";
import type { ScrapOperations } from "./scrapOperations.schema";
import { logger } from "../../logger";

/**
 * Serviço responsável por disparar scrapers no BrightData e processar resultados
 */
export class BrightDataService {
  private app: Application;
  private apiToken: string;
  private apiEndpoint: string;

  constructor(app: Application) {
    this.app = app;
    this.apiToken = process.env.BRIGHTDATA_API_TOKEN || "";
    this.apiEndpoint = "https://api.brightdata.com/scraper/run"; // endpoint de batch
  }

  /**
   * Apenas analisa o banco de dados local de acordo com target_conditions
   */
  public async analyzeTargetConditions(op: ScrapOperations) {
    if (!op.target_conditions || !Array.isArray(op.target_conditions)) {
      logger.warn(
        "[BrightDataService] Operation has no target_conditions or invalid format",
        { operationId: op.id }
      );
      return [];
    }

    const knex = this.app.get("postgresqlClient");

    const filters = op.target_conditions as Array<{ field: string; value: string }>;
    let query = knex("students").select("*");

    for (const f of filters) {
      let value: any = f.value;

      // Conversão automática de booleanos
      const booleanFields = ["working", "hasDisability"]; // campos booleanos
      if (booleanFields.includes(f.field)) {
        if (value === "true" || value === "Sim") value = true;
        else if (value === "false" || value === "Não") value = false;
      }

      logger.debug("[BrightDataService] Applying filter", {
        field: f.field,
        originalValue: f.value,
        parsedValue: value,
      });

      query = query.where(f.field, value);
    }

    // Mostra a SQL gerada
    const sqlInfo = query.toSQL();
    logger.debug("[BrightDataService] SQL query prepared", {
      sql: sqlInfo.sql,
      bindings: sqlInfo.bindings,
    });

    const dbResults = await query;

    logger.info("[BrightDataService] Local DB analysis completed", {
      operationId: op.id,
      filters,
      count: dbResults.length,
      results: dbResults,
    });

    return dbResults;
  }

  /**
   * Executa um scraper BrightData para uma operação
   */
  public async runOperation(op: ScrapOperations) {
    if (!op.target_conditions || !Array.isArray(op.target_conditions)) {
      logger.warn(
        "[BrightDataService] Operation has no target_conditions or invalid format",
        { operationId: op.id }
      );
      return [];
    }

    const filters = op.target_conditions as Array<{ field: string; value: string }>;

    const payload = {
      scraper_id: process.env.BRIGHTDATA_SCRAPER_ID,
      collection_method: "batch",
      params: {
        filters,
        operationId: op.id,
      },
    };

    try {
      const res = await axios.post(this.apiEndpoint, payload, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      logger.info("[BrightDataService] BrightData batch triggered", {
        operationId: op.id,
        responseId: res.data?.id,
      });

      return res.data;
    } catch (err: any) {
      logger.error("[BrightDataService] BrightData batch request failed", {
        operationId: op.id,
        error: err?.message ?? String(err),
      });
      throw err;
    }
  }
}
