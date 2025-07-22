// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Students, StudentsData, StudentsPatch, StudentsQuery, StudentsService } from './students.class'

export type { Students, StudentsData, StudentsPatch, StudentsQuery }

export type StudentsClientService = Pick<
  StudentsService<Params<StudentsQuery>>,
  (typeof studentsMethods)[number]
>

export const studentsPath = 'students'

export const studentsMethods: Array<keyof StudentsService> = ['find', 'get', 'create', 'patch', 'remove']

export const studentsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(studentsPath, connection.service(studentsPath), {
    methods: studentsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [studentsPath]: StudentsClientService
  }
}
