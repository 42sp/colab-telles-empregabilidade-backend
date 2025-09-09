import type {
  Paginated,
  PaginationOptions
} from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import type {
  ScrapOperations,
  ScrapOperationsData,
  ScrapOperationsQuery
} from './scrapOperations.schema'

import { logger } from '../../logger'

// 🔹 Tipo extendido incluindo _source
type ScrapOpWithSource = ScrapOperations & { _source?: 'cronjob' | 'user' | 'unknown' }

export interface ScrapOperationsParams
  extends KnexAdapterParams<ScrapOperationsQuery> {
  source?: 'cronjob' | 'user' | 'unknown'
}

export class ScrapOperationsService extends KnexService<
  ScrapOperations,
  ScrapOperationsData,
  ScrapOperationsParams
> {
  // ------------------------------
  // FIND
  // ------------------------------
  async find(
    params?: ScrapOperationsParams & { paginate?: PaginationOptions }
  ): Promise<Paginated<ScrapOperations>>
  async find(
    params?: ScrapOperationsParams & { paginate: false }
  ): Promise<ScrapOperations[]>
  async find(
    params?: ScrapOperationsParams
  ): Promise<Paginated<ScrapOperations> | ScrapOperations[]> {
    const result = await super.find(params as any)
    const count = Array.isArray(result) ? result.length : result.total

    logger.debug("[ScrapOpsService] find executed", {
      queryType: params?.query?.type || "default",
      count
    })

    return result
  }

  // ------------------------------
  // CREATE
  // ------------------------------
  async create(
    data: ScrapOperationsData,
    params?: ScrapOperationsParams
  ): Promise<ScrapOpWithSource>
  async create(
    data: ScrapOperationsData[],
    params?: ScrapOperationsParams
  ): Promise<ScrapOpWithSource[]>
  async create(
    data: ScrapOperationsData | ScrapOperationsData[],
    params?: ScrapOperationsParams
  ): Promise<ScrapOpWithSource | ScrapOpWithSource[]> {
    const result = await super.create(data as any, params)

    logger.info("[ScrapOpsService] create", {
      source: params?.source ?? "unknown",
      isArray: Array.isArray(data)
    })

    if (Array.isArray(result)) {
      return result.map(item => ({ ...(item as ScrapOperations), _source: params?.source ?? 'unknown' }))
    } else {
      return { ...(result as ScrapOperations), _source: params?.source ?? 'unknown' }
    }
  }

  // ------------------------------
  // PATCH
  // ------------------------------
  async patch(
    id: null,
    data: Partial<ScrapOperationsData>,
    params?: ScrapOperationsParams
  ): Promise<ScrapOpWithSource[]>
  async patch(
    id: string | number,
    data: Partial<ScrapOperationsData>,
    params?: ScrapOperationsParams
  ): Promise<ScrapOpWithSource>
  async patch(
    id: string | number | null,
    data: Partial<ScrapOperationsData>,
    params?: ScrapOperationsParams
  ): Promise<ScrapOpWithSource | ScrapOpWithSource[]> {
    const source =
      params?.source || (params?.query as any)?.$source || 'unknown'

    logger.info("[ScrapOpsService] patch", {
      id: id ?? "multiple",
      source,
      fields: Object.keys(data)
    })

    const result = await super.patch(id as any, data, params)

    if (Array.isArray(result)) {
      return result.map(item => ({
        ...(item as ScrapOperations),
        _source: source
      }))
    } else {
      return {
        ...(result as ScrapOperations),
        _source: source
      }
    }
  }

  // ------------------------------
  // REMOVE
  // ------------------------------
  async remove(
    id: null,
    params?: ScrapOperationsParams
  ): Promise<ScrapOpWithSource[]>
  async remove(
    id: string | number,
    params?: ScrapOperationsParams
  ): Promise<ScrapOpWithSource>
  async remove(
    id: string | number | null,
    params?: ScrapOperationsParams
  ): Promise<ScrapOpWithSource | ScrapOpWithSource[]> {
    logger.info("[ScrapOpsService] remove", {
      id: id ?? "multiple",
      source: params?.source ?? "unknown"
    })

    const result = await super.remove(id as any, params)

    if (Array.isArray(result)) {
      return result.map(item => ({ ...(item as ScrapOperations), _source: params?.source ?? 'unknown' }))
    } else {
      return { ...(result as ScrapOperations), _source: params?.source ?? 'unknown' }
    }
  }
}
