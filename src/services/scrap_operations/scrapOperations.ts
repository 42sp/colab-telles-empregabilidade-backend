import type { Application } from '../../declarations'
import { ScrapOperationsService } from './scrapOperations.class'
import { scrapOperationsPath, scrapOperationsMethods } from './scrapOperations.shared'
import hooks from './scrapOperations.hooks'

export * from './scrapOperations.class'
export * from './scrapOperations.schema'


export const scrapOperations = (app: Application) => {
  const options = {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'scrap_operations',
    id: 'id'
  }

  app.use(scrapOperationsPath, new ScrapOperationsService(options), {
    methods: scrapOperationsMethods,
    events: []
  })

  const service = app.service(scrapOperationsPath)
  service.hooks(hooks)
}
