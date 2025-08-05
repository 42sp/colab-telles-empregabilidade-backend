import type { Application } from '../../declarations'
import { ScrapOperationsService } from './scrapOperations.class'
import { scrapOperationsPath, scrapOperationsMethods } from './scrapOperations.shared'
import hooks from './scrapOperations.hooks'

export * from './scrapOperations.class'
export * from './scrapOperations.schema'

// NÃO repita a interface ServiceTypes aqui. Isso já está em `declarations.ts`

export const scrapOperations = (app: Application) => {
  const options = {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'scrap_operations'
  }
  console.log('[INIT] Registrando scrapOperations em', scrapOperationsPath)

  app.use(scrapOperationsPath, new ScrapOperationsService(options), {
    methods: scrapOperationsMethods,
    events: []
  })

  const service = app.service(scrapOperationsPath)
  service.hooks(hooks)
}
