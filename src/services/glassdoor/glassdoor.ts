// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  glassdoorDataValidator,
  glassdoorPatchValidator,
  glassdoorQueryValidator,
  glassdoorResolver,
  glassdoorExternalResolver,
  glassdoorDataResolver,
  glassdoorPatchResolver,
  glassdoorQueryResolver
} from './glassdoor.schema'

import type { Application } from '../../declarations'
import { GlassdoorService, getOptions } from './glassdoor.class'
import { glassdoorPath, glassdoorMethods } from './glassdoor.shared'

export * from './glassdoor.class'
export * from './glassdoor.schema'

const useCustomAuthHeader = (name = 'auth_header') => {
  return async (context: any, next: any) => {
    const headers = context.params?.headers ?? {};
    const raw = headers[name] ?? headers[name.toLowerCase()];
    if (raw && !context.params.authentication) {
      const value = Array.isArray(raw) ? raw[0] : String(raw);
      const token = value.startsWith('Bearer ') ? value.slice(7) : value;
      context.params.authentication = { strategy: 'jwt', accessToken: token };
    }
    await next();
  };
};

// A configure function that registers the service and its hooks via `app.configure`
export const glassdoor = (app: Application) => {
  // Register our service on the Feathers application
  app.use(glassdoorPath, new GlassdoorService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: glassdoorMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(glassdoorPath).hooks({
    around: {
      all: [
				useCustomAuthHeader('auth_header'),
        authenticate('jwt'),
        schemaHooks.resolveExternal(glassdoorExternalResolver),
        schemaHooks.resolveResult(glassdoorResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(glassdoorQueryValidator),
        schemaHooks.resolveQuery(glassdoorQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(glassdoorDataValidator),
        schemaHooks.resolveData(glassdoorDataResolver)
      ],
      patch: [
        schemaHooks.validateData(glassdoorPatchValidator),
        schemaHooks.resolveData(glassdoorPatchResolver)
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
    [glassdoorPath]: GlassdoorService
  }
}
