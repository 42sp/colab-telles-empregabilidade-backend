// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Conversions,
  ConversionsData,
  ConversionsPatch,
  ConversionsQuery,
  ConversionsService
} from './conversions.class'

export type { Conversions, ConversionsData, ConversionsPatch, ConversionsQuery }

export type ConversionsClientService = Pick<
  ConversionsService<Params<ConversionsQuery>>,
  (typeof conversionsMethods)[number]
>

export const conversionsPath = 'conversions'

export const conversionsMethods: Array<keyof ConversionsService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const conversionsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(conversionsPath, connection.service(conversionsPath), {
    methods: conversionsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [conversionsPath]: ConversionsClientService
  }
}
