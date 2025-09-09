// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Glassdoor, GlassdoorData, GlassdoorPatch, GlassdoorQuery } from './glassdoor.schema'

export type { Glassdoor, GlassdoorData, GlassdoorPatch, GlassdoorQuery }

export interface GlassdoorParams extends KnexAdapterParams<GlassdoorQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class GlassdoorService<ServiceParams extends Params = GlassdoorParams> extends KnexService<
  Glassdoor,
  GlassdoorData,
  GlassdoorParams,
  GlassdoorPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'glassdoor',
		multi: true
  }
}
