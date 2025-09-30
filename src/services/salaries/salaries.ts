import type { Application } from '../../declarations'
import { SalariesService } from './salaries.class'
import { salariesPath } from './salaries.shared'

export const salaries = (app: Application) => {
  app.use(
    salariesPath as any,
    new SalariesService(
      {
        paginate: app.get('paginate'),
        Model: app.get('postgresqlClient'), // aqui precisa estar configurado no app.ts
        name: 'salaries'
      },
      app
    )
  )

  // hooks
  app.service(salariesPath as any).hooks({
    around: {
      all: [],
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
