// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  linkedinDataValidator,
  linkedinPatchValidator,
  linkedinQueryValidator,
  linkedinResolver,
  linkedinExternalResolver,
  linkedinDataResolver,
  linkedinPatchResolver,
  linkedinQueryResolver
} from './linkedin.schema'

import type { Application, HookContext, NextFunction } from '../../declarations'
import { LinkedinDashboardService, LinkedinService, getOptions } from './linkedin.class'
import { linkedinPath, linkedinMethods, linkedinDashboardPath, linkedinDashboardMethods } from './linkedin.shared'
import { get } from 'http'

export * from './linkedin.class'
export * from './linkedin.schema'

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
export const linkedin = (app: Application) => {
  // Register our service on the Feathers application
  app.use(linkedinPath, new LinkedinService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: linkedinMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(linkedinPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
				// useCustomAuthHeader('auth_header'),
        schemaHooks.resolveExternal(linkedinExternalResolver),
        schemaHooks.resolveResult(linkedinResolver),
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(linkedinQueryValidator),
        schemaHooks.resolveQuery(linkedinQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(linkedinDataValidator),
        schemaHooks.resolveData(linkedinDataResolver)
      ],
      patch: [
        schemaHooks.validateData(linkedinPatchValidator),
        schemaHooks.resolveData(linkedinPatchResolver)
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

export const linkedinDashboard = (app: Application) => {
	app.use(linkedinDashboardPath, new LinkedinDashboardService(getOptions(app)), {
		// A list of all methods this service exposes externally
		methods: linkedinDashboardMethods,

		events: []
	})

	app.service(linkedinDashboardPath).hooks({
		around: {
			all: [
				authenticate('jwt'),
				// useCustomAuthHeader('auth_header'),
				// schemaHooks.resolveExternal(linkedinExternalResolver),
				// schemaHooks.resolveResult(linkedinResolver),
			]
		},
		before: {
			all: [
				// schemaHooks.validateQuery(linkedinQueryValidator),
				// schemaHooks.resolveQuery(linkedinQueryResolver)
			],
			find: []
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
    [linkedinPath]: LinkedinService
		[linkedinDashboardPath]: LinkedinDashboardService
  }
}
