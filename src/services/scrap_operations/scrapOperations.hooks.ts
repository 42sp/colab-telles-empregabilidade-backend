import type { HookContext } from '@feathersjs/feathers'
import { getScrapOperationsDataValidator } from './scrapOperations.validator'
import { logger } from '../../logger'

const scrapOperationsDataValidator = getScrapOperationsDataValidator()

export default {
  before: {
    create: [
      async (context: HookContext) => {
        try {
          await scrapOperationsDataValidator.create(context.data)
        } catch (err: any) {
          logger.error('[scrap-operations][before.create] Falha na validação', {
            error: err.message,
            data: context.data
          })
          throw err
        }

        context.data = {
          ...context.data,
          status: 'Agendado',
          started_at: null,
          finished_at: null
        }

        logger.info('[scrap-operations][before.create] Nova operação agendada', {
          user: context.params?.user || 'anonymous',
          name: context.data.name
        })

        return context
      }
    ],
    update: [
      async (context: HookContext) => {
        try {
          await scrapOperationsDataValidator.update(context.data)
        } catch (err: any) {
          logger.error('[scrap-operations][before.update] Falha na validação', {
            error: err.message,
            id: context.id
          })
          throw err
        }
        return context
      }
    ],
    patch: [
      async (context: HookContext) => {
        const source =
          context.data?._source || context.params?.source || context.params?.query?.$source || 'unknown'

        const user =
          context.data?._user || context.params?.user || context.params?.headers?.user || 'anonymous'

        // Sanitização
        if ('_source' in context.data) delete context.data._source
        if ('_user' in context.data) delete context.data._user

        const allowedFields = [
          'name',
          'scheduled_date',
          'scheduled_time',
          'user_tag',
          'repeat_days',
          'repeat_time',
          'status',
          'result',
          'error_message',
          'started_at',
          'finished_at',
          'deleted',
          'deleted_at',
          'deleted_by'
        ]

        context.data = Object.fromEntries(
          Object.entries(context.data).filter(([key]) => allowedFields.includes(key))
        )

        if (context.data.scheduled_date?.includes('T')) {
          context.data.scheduled_date = context.data.scheduled_date.split('T')[0]
        }

        try {
          const validator = (await import('./scrapOperations.validator')).getScrapOperationsDataValidator()
          await validator.patch(context.data)
        } catch (err: any) {
          logger.error('[scrap-operations][before.patch] Falha na validação', {
            error: err.message,
            id: context.id
          })
          throw new Error('Falha na validação do patch: ' + JSON.stringify(err.errors || err))
        }

        context.params.source = source
        context.params.user = user

        logger.debug('[scrap-operations][before.patch] Patch preparado', {
          id: context.id,
          source,
          user,
          fields: Object.keys(context.data)
        })

        return context
      }
    ],
    remove: []
  },
  after: {
    patch: [
      async (context: HookContext) => {
        const result = context.result
        const source = context.params?.source || 'system'
        const user = context.params?.user || 'anonymous'
        
        logger.info("[scrap-operations][after.patch] Dispatch:", context.dispatch)
        context.dispatch = { ...result, _source: source, _user: user }

        logger.info('[scrap-operations][after.patch] Patch concluído', {
          id: context.id,
          source,
          user,
          status: result?.status
        })

        return context
      }
    ]
  }
}
