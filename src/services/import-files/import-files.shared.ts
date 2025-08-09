// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  ImportFiles,
  ImportFilesData,
  ImportFilesPatch,
  ImportFilesQuery,
  ImportFilesService
} from './import-files.class'

export type { ImportFiles, ImportFilesData, ImportFilesPatch, ImportFilesQuery }

export type ImportFilesClientService = Pick<
  ImportFilesService<Params<ImportFilesQuery>>,
  (typeof importFilesMethods)[number]
>

export const importFilesPath = 'import-files'

export const importFilesMethods: Array<keyof ImportFilesService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const importFilesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(importFilesPath, connection.service(importFilesPath), {
    methods: importFilesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [importFilesPath]: ImportFilesClientService
  }
}
