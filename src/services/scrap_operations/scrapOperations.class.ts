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
  // Overloads para respeitar assinatura base do método find
  async find(params?: ScrapOperationsParams & { paginate?: PaginationOptions }): Promise<Paginated<ScrapOperations>>
  async find(params?: ScrapOperationsParams & { paginate: false }): Promise<ScrapOperations[]>
  async find(params?: ScrapOperationsParams): Promise<Paginated<ScrapOperations> | ScrapOperations[]> {
    // Se o parâmetro query.type for 'active', altera a query para filtrar status 'Agendado' e ordenar pela data agendada ascendente
    if (params?.query?.type === 'active') {
      return super.find({
        ...params, // espalha os outros parâmetros recebidos
        query: {
          ...params.query, // espalha os filtros da query originais
          status: 'Agendado', // adiciona filtro fixo status = 'Agendado'
          $sort: { scheduled_date: 1 } // ordena pela data agendada crescente
        }
      })
    }

    // Se o parâmetro query.type for 'history', altera a query para filtrar status diferente de 'Agendado' e ordenar pelo início decrescente
    if (params?.query?.type === 'history') {
      return super.find({
        ...params,
        query: {
          ...params.query,
          status: { $ne: 'Agendado' }, // filtro status diferente de 'Agendado'
          $sort: { started_at: -1 } // ordena pelo campo started_at decrescente
        }
      })
    }

    // Se não houver tipo definido na query ou não for 'active' nem 'history', chama find normal do super sem alteração
    return super.find(params)
  }
}