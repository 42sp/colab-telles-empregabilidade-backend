// scrapOperations.class.ts
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
    console.log('[SVC][FIND->] params.query:', params?.query)

    let result: Paginated<ScrapOperations> | ScrapOperations[]

    if (params?.query?.type === 'active') {
      result = await super.find({
        ...params,
        query: { ...params.query, status: 'Agendado', $sort: { scheduled_date: 1 } }
      })
    } else if (params?.query?.type === 'history') {
      result = await super.find({
        ...params,
        query: {
          ...params.query,
          $or: [{ status: { $ne: 'Agendado' } }, { deleted: true }],
          $sort: { started_at: -1 }
        }
      })
    } else {
      result = await super.find(params as any)
    }

    const count = Array.isArray(result) ? result.length : result.total
    console.log('[SVC][FIND<-] ok, count:', count)
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
    console.log('[SVC][CREATE->] source:', params?.source ?? 'unknown')

    const result = await super.create(data as any, params)

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
    console.log('[SVC][PATCH->]', { id, source: params?.source ?? 'unknown', data })

    const result = await super.patch(id as any, data, params)

    if (Array.isArray(result)) {
      return result.map(item => ({ ...(item as ScrapOperations), _source: params?.source ?? 'unknown' }))
    } else {
      return { ...(result as ScrapOperations), _source: params?.source ?? 'unknown' }
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
    console.log('[SVC][REMOVE->]', { id, source: params?.source ?? 'unknown' })

    const result = await super.remove(id as any, params)

    if (Array.isArray(result)) {
      return result.map(item => ({ ...(item as ScrapOperations), _source: params?.source ?? 'unknown' }))
    } else {
      return { ...(result as ScrapOperations), _source: params?.source ?? 'unknown' }
    }
  }
}
