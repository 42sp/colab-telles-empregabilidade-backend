// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type {
  ImportedFiles,
  ImportedFilesData,
  ImportedFilesPatch,
  ImportedFilesQuery
} from './imported-files.schema'

export type { ImportedFiles, ImportedFilesData, ImportedFilesPatch, ImportedFilesQuery }

export interface ImportedFilesParams extends KnexAdapterParams<ImportedFilesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ImportedFilesService<ServiceParams extends Params = ImportedFilesParams> extends KnexService<
  ImportedFiles,
  ImportedFilesData,
  ImportedFilesParams,
  ImportedFilesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'imported-files'
  }
}
