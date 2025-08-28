// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Students, StudentsData, StudentsPatch, StudentsQuery } from './students.schema'
import type { Knex } from 'knex'

export type { Students, StudentsData, StudentsPatch, StudentsQuery }

export interface StudentsParams extends KnexAdapterParams<StudentsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class StudentsService<ServiceParams extends Params = StudentsParams> extends KnexService<
  Students,
  StudentsData,
  StudentsParams,
  StudentsPatch
> {
  async stats(params: Params = {}) {
    const knex = this.Model as Knex
    const filters = (params.query ?? {}) as Record<string, any>

    const q = knex('students')

    // Aplicar filtros simples (igualdade). Ignora keys que começam com $
    Object.entries(filters).forEach(([key, value]) => {
      if (!value && value !== false && value !== 0) return
      if (key.startsWith('$')) return
      if (['$limit', '$skip', 'limit', 'skip', 'paginate'].includes(key)) return

      // tradução básica "sim"/"não" -> boolean (opcional; ajuste se necessário)
      if (typeof value === 'string') {
        const lower = value.toLowerCase()
        if (lower === 'sim') value = true
        if (lower === 'não' || lower === 'nao') value = false
      }

      q.where(key, value)
    })

    // Executa uma única query agregada
    const raw = await q
      .select(
        knex.raw('COUNT(*)::int AS total'),
        knex.raw('COUNT(*) FILTER (WHERE working = true)::int AS working'),
        knex.raw('COUNT(*) FILTER (WHERE working = false)::int AS not_working'),
        // se compensation for numeric use AVG(compensation). Ajuste abaixo se for string suja.
        knex.raw('AVG(compensation)::numeric AS avg_compensation')
      )
      .first()

    return {
      total: Number(raw?.total ?? 0),
      working: Number(raw?.working ?? 0),
      notWorking: Number(raw?.not_working ?? 0),
      avgCompensation:
        raw?.avg_compensation === null || raw?.avg_compensation === undefined
          ? 0
          : Number(raw.avg_compensation)
    }
  }
}
export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'students'
  }
}
