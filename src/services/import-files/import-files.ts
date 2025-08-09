// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  importFilesDataValidator,
  importFilesPatchValidator,
  importFilesQueryValidator,
  importFilesResolver,
  importFilesExternalResolver,
  importFilesDataResolver,
  importFilesPatchResolver,
  importFilesQueryResolver
} from './import-files.schema'

import type { Application } from '../../declarations'
import { ImportFilesService, getOptions } from './import-files.class'
import { importFilesPath, importFilesMethods } from './import-files.shared'

export * from './import-files.class'
export * from './import-files.schema'

import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() }) // arquivos ficam em memória


// A configure function that registers the service and its hooks via `app.configure`
export const importFiles = (app: Application) => {
  app.use(
    importFilesPath,
    upload.single('file'),

    (req, res, next) => {
      req.feathers.file = req.file;
      next();
    },
		new ImportFilesService(getOptions(app)),
  );

  app.service(importFilesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
      ]
    },
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      patch: [],
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
    [importFilesPath]: ImportFilesService
  }
}
