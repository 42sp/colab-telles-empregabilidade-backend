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
import express, { Request, Response } from 'express';

export const students = (app: Application) => {
  const service = new StudentsService(getOptions(app));

  // Rota principal do service
  app.use(studentsPath, service, { methods: studentsMethods, events: [] });

  // Rota customizada para stats usando express
  const router = express.Router();

  router.get('/', async (req: Request, res: Response) => {
    try {
      const result = await service.stats({ query: req.query });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.use(`${studentsPath}/stats`, router);

  // Hooks do service
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
    after: { all: [] },
    error: { all: [] }
  });
};



// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [studentsPath]: StudentsService
  }
}
