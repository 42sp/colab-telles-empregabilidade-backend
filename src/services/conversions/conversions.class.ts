// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Conversions, ConversionsData, ConversionsPatch, ConversionsQuery } from './conversions.schema'

export type { Conversions, ConversionsData, ConversionsPatch, ConversionsQuery }

export interface ConversionsParams extends KnexAdapterParams<ConversionsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ConversionsService<ServiceParams extends Params = ConversionsParams> extends KnexService<
  Conversions,
  ConversionsData,
  ConversionsParams,
  ConversionsPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'conversions'
  }
}
