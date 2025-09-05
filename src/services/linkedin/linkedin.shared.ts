// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Linkedin, LinkedinData, LinkedinPatch, LinkedinQuery, LinkedinService } from './linkedin.class'

export type { Linkedin, LinkedinData, LinkedinPatch, LinkedinQuery }

export type LinkedinClientService = Pick<
  LinkedinService<Params<LinkedinQuery>>,
  (typeof linkedinMethods)[number]
>

export const linkedinPath = 'linkedin'

export const linkedinMethods: Array<keyof LinkedinService> = ['find', 'get', 'create', 'patch', 'remove']

export const linkedinClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(linkedinPath, connection.service(linkedinPath), {
    methods: linkedinMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [linkedinPath]: LinkedinClientService
  }
}
