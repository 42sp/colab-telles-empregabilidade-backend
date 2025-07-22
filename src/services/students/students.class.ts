// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Students, StudentsData, StudentsPatch, StudentsQuery } from './students.schema'

export type { Students, StudentsData, StudentsPatch, StudentsQuery }

export interface StudentsParams extends KnexAdapterParams<StudentsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class StudentsService<ServiceParams extends Params = StudentsParams> extends KnexService<
  Students,
  StudentsData,
  StudentsParams,
  StudentsPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'students'
  }
}
