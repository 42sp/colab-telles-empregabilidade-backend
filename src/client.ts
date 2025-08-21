// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { importedFilesClient } from './services/imported-files/imported-files.shared'
export type {
  ImportedFiles,
  ImportedFilesData,
  ImportedFilesQuery,
  ImportedFilesPatch
} from './services/imported-files/imported-files.shared'

import { importFilesClient } from './services/import-files/import-files.shared'
export type {
  ImportFiles,
  ImportFilesData,
  ImportFilesQuery,
  ImportFilesPatch
} from './services/import-files/import-files.shared'

import { conversionsClient } from './services/conversions/conversions.shared'
export type {
  Conversions,
  ConversionsData,
  ConversionsQuery,
  ConversionsPatch
} from './services/conversions/conversions.shared'

import { studentsClient } from './services/students/students.shared'
export type {
  Students,
  StudentsData,
  StudentsQuery,
  StudentsPatch
} from './services/students/students.shared'

import { userClient } from './services/users/users.shared'
export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the colab-telles-empregabilidade-backend app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any,>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(userClient)
  client.configure(studentsClient)
  client.configure(conversionsClient)
  client.configure(importFilesClient)
  client.configure(importedFilesClient)
  return client
}
