import type { HookContext } from '@feathersjs/feathers'
import { getScrapOperationsDataValidator } from './scrapOperations.validator'

const scrapOperationsDataValidator = getScrapOperationsDataValidator()

export default {
  before: {
    create: [
      async (context: HookContext) => {
        try {
          await scrapOperationsDataValidator.create(context.data)
        } catch (err: any) {
          throw err
        }

        // Injeta defaults
        context.data = {
          ...context.data,
          status: 'Agendado',
          started_at: null,
          finished_at: null
        }
        return context
      }
    ],
    update: [
      async (context: HookContext) => {
        try {
          await scrapOperationsDataValidator.update(context.data)
        } catch (err: any) {
          throw err
        }
        return context
      }
    ],
    patch: [
      async (context: HookContext) => {
        // Captura a origem se vier nos params
        const source = context.params?.source || 'unknown'

        // Lista de campos permitidos
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

        // Filtra apenas os campos permitidos (não salva "source" no banco)
        context.data = Object.fromEntries(
          Object.entries(context.data).filter(([key]) => allowedFields.includes(key))
        )

        // Ajusta scheduled_date se vier com timestamp
        if (context.data.scheduled_date?.includes('T')) {
          context.data.scheduled_date = context.data.scheduled_date.split('T')[0]
        }

        // Validação
        try {
          const validator = (await import('./scrapOperations.validator')).getScrapOperationsDataValidator()
          await validator.patch(context.data)
        } catch (err: any) {
          throw new Error('Falha na validação do patch: ' + JSON.stringify(err.errors || err))
        }

        // Guarda a origem em params (não vai pro banco)
        context.params = {
          ...context.params,
          source
        }

        console.log('[HOOK before.patch] context.params.source:', context.params?.source)
        return context
      }
    ],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [
      async (context: HookContext) => {
        const result = context.result
        const source = context.params?.source || 'system'

        // Garante que _source vai no payload WS
        context.dispatch = { ...result, _source: source }

        console.log('[HOOK after.patch] Enviando dispatch com _source:', context.dispatch)

        return context
      }
    ],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
