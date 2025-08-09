// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  conversionsDataValidator,
  conversionsPatchValidator,
  conversionsQueryValidator,
  conversionsResolver,
  conversionsExternalResolver,
  conversionsDataResolver,
  conversionsPatchResolver,
  conversionsQueryResolver
} from './conversions.schema'

import type { Application } from '../../declarations'
import { ConversionsService, getOptions } from './conversions.class'
import { conversionsPath, conversionsMethods } from './conversions.shared'

export * from './conversions.class'
export * from './conversions.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const conversions = (app: Application) => {
  // Register our service on the Feathers application
  app.use(conversionsPath, new ConversionsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: conversionsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(conversionsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(conversionsExternalResolver),
        schemaHooks.resolveResult(conversionsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(conversionsQueryValidator),
        schemaHooks.resolveQuery(conversionsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(conversionsDataValidator),
        schemaHooks.resolveData(conversionsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(conversionsPatchValidator),
        schemaHooks.resolveData(conversionsPatchResolver)
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
    [conversionsPath]: ConversionsService
  }
}
