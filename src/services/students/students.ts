// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  studentsDataValidator,
  studentsPatchValidator,
  studentsQueryValidator,
  studentsResolver,
  studentsExternalResolver,
  studentsDataResolver,
  studentsPatchResolver,
  studentsQueryResolver
} from './students.schema'

import type { Application } from '../../declarations'
import { StudentsService, getOptions } from './students.class'
import { studentsPath, studentsMethods } from './students.shared'

export * from './students.class'
export * from './students.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const students = (app: Application) => {
  // Register our service on the Feathers application
  app.use(studentsPath, new StudentsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: studentsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(studentsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(studentsExternalResolver),
        schemaHooks.resolveResult(studentsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(studentsQueryValidator),
        schemaHooks.resolveQuery(studentsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(studentsDataValidator),
        schemaHooks.resolveData(studentsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(studentsPatchValidator),
        schemaHooks.resolveData(studentsPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [studentsPath]: StudentsService
  }
}
