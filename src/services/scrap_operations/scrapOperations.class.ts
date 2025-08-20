import type { Params, Paginated, PaginationOptions } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'
import type { ScrapOperations, ScrapOperationsData, ScrapOperationsQuery } from './scrapOperations.schema'

export interface ScrapOperationsParams extends KnexAdapterParams<ScrapOperationsQuery> {}

export class ScrapOperationsService extends KnexService<
  ScrapOperations,
  ScrapOperationsData,
  ScrapOperationsParams
> {
  // Sobrescreve o find mantendo lógica customizada
  async find(
    params?: ScrapOperationsParams & { paginate?: PaginationOptions }
  ): Promise<Paginated<ScrapOperations>>
  async find(params?: ScrapOperationsParams & { paginate: false }): Promise<ScrapOperations[]>
  async find(params?: ScrapOperationsParams): Promise<Paginated<ScrapOperations> | ScrapOperations[]> {
    if (params?.query?.type === 'active') {
      return super.find({
        ...params,
        query: { ...params.query, status: 'Agendado', $sort: { scheduled_date: 1 } }
      })
    }
    if (params?.query?.type === 'history') {
      // Retorna todas que não estão agendadas ou que foram deletadas
      return super.find({
        ...params,
        query: {
          ...params.query,
          $or: [{ status: { $ne: 'Agendado' } }, { deleted: true }],
          $sort: { started_at: -1 }
        }
      })
    }
    return super.find(params)
  }

  // Sobrecarga do patch
  async patch(
    id: string | number,
    data: Partial<ScrapOperations>,
    params?: ScrapOperationsParams
  ): Promise<ScrapOperations>
  async patch(
    id: null,
    data: Partial<ScrapOperations>,
    params?: ScrapOperationsParams
  ): Promise<ScrapOperations[]>
  async patch(
    id: string | number | null,
    data: Partial<ScrapOperations>,
    params?: ScrapOperationsParams
  ): Promise<ScrapOperations | ScrapOperations[]> {
    const result = await super.patch(id, data, params)

    // Normaliza para array e emite eventos
    const resultsArray = Array.isArray(result) ? result : [result]
    for (const r of resultsArray) {
      if (r.status === 'Em Execução') {
        ;(this as any).emit('operation:started', r, params)
      } else if (r.status === 'Concluído') {
        ;(this as any).emit('operation:finished', r, params)
      } else if (r.status === 'Falha') {
        ;(this as any).emit('operation:failed', r, params)
      }
    }

    return result
  }
}
