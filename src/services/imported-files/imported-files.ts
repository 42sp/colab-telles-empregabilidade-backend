// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  importedFilesDataValidator,
  importedFilesPatchValidator,
  importedFilesQueryValidator,
  importedFilesResolver,
  importedFilesExternalResolver,
  importedFilesDataResolver,
  importedFilesPatchResolver,
  importedFilesQueryResolver
} from './imported-files.schema'

import type { Application, HookContext } from '../../declarations'
import { ImportedFilesService, getOptions } from './imported-files.class'
import { importedFilesPath, importedFilesMethods } from './imported-files.shared'
import { User } from '../users/users.class'

export * from './imported-files.class'
export * from './imported-files.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const importedFiles = (app: Application) => {
  // Register our service on the Feathers application
  app.use(importedFilesPath, new ImportedFilesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: importedFilesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(importedFilesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(importedFilesExternalResolver),
        schemaHooks.resolveResult(importedFilesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(importedFilesQueryValidator),
        schemaHooks.resolveQuery(importedFilesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(importedFilesDataValidator),
        schemaHooks.resolveData(importedFilesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(importedFilesPatchValidator),
        schemaHooks.resolveData(importedFilesPatchResolver)
      ],
      remove: []
    },
    after: {
      all: [
        async (context: HookContext) => {
					if (
						context.result && context.result.data[0].userId
					) {
						try {
							for (const item of context.result.data) {
								const user = await context.app.service('users').get(item.userId);
								(item as any).user = user;
							}
						} catch (e) {
							console.error('Error fetching user:', e);
						}
					}
          return context;
        }
      ]
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [importedFilesPath]: ImportedFilesService
  }
}
