// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  ImportedFiles,
  ImportedFilesData,
  ImportedFilesPatch,
  ImportedFilesQuery,
  ImportedFilesService
} from './imported-files.class'

export type { ImportedFiles, ImportedFilesData, ImportedFilesPatch, ImportedFilesQuery }

export type ImportedFilesClientService = Pick<
  ImportedFilesService<Params<ImportedFilesQuery>>,
  (typeof importedFilesMethods)[number]
>

export const importedFilesPath = 'imported-files'

export const importedFilesMethods: Array<keyof ImportedFilesService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const importedFilesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(importedFilesPath, connection.service(importedFilesPath), {
    methods: importedFilesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [importedFilesPath]: ImportedFilesClientService
  }
}
