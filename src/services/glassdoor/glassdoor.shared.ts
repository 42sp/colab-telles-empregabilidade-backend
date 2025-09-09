// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Glassdoor,
  GlassdoorData,
  GlassdoorPatch,
  GlassdoorQuery,
  GlassdoorService
} from './glassdoor.class'

export type { Glassdoor, GlassdoorData, GlassdoorPatch, GlassdoorQuery }

export type GlassdoorClientService = Pick<
  GlassdoorService<Params<GlassdoorQuery>>,
  (typeof glassdoorMethods)[number]
>

export const glassdoorPath = 'glassdoor'

export const glassdoorMethods: Array<keyof GlassdoorService> = ['find', 'get', 'create', 'patch', 'remove']

export const glassdoorClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(glassdoorPath, connection.service(glassdoorPath), {
    methods: glassdoorMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [glassdoorPath]: GlassdoorClientService
  }
}
