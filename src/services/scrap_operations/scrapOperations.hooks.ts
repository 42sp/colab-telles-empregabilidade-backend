import type { HookContext } from '@feathersjs/feathers'
import { getScrapOperationsDataValidator } from './scrapOperations.validator'

const scrapOperationsDataValidator = getScrapOperationsDataValidator()

export default {
  before: {
    create: [
      async (context: HookContext) => {
        //console.log('[HOOK DEBUG] create payload recebido:', JSON.stringify(context.data, null, 2))
        try {
          await scrapOperationsDataValidator.create(context.data)
        } catch (err: any) {
          //console.error('[HOOK DEBUG] erro de validação create:', JSON.stringify(err.errors || err, null, 2))
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
        //console.log('[HOOK DEBUG] update payload recebido:', JSON.stringify(context.data, null, 2))
        try {
          await scrapOperationsDataValidator.update(context.data)
        } catch (err: any) {
          //console.error('[HOOK DEBUG] erro de validação update:', JSON.stringify(err.errors || err, null, 2))
          throw err
        }
        return context
      }
    ],
    patch: [
      async (context: HookContext) => {
        //console.log('[HOOK DEBUG] patch payload recebido:', context.data)

        // Lista de campos permitidos para patch
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

        // Filtra apenas os campos permitidos
        context.data = Object.fromEntries(
          Object.entries(context.data).filter(([key]) =>
            allowedFields.includes(key)
          )
        )

        // Ajusta scheduled_date se vier com timestamp
        if (context.data.scheduled_date?.includes('T')) {
          context.data.scheduled_date = context.data.scheduled_date.split('T')[0]
        }

        //console.log('[HOOK DEBUG] patch payload filtrado:', context.data)

        // Valida o payload filtrado
        try {
          await scrapOperationsDataValidator.patch(context.data)
        } catch (err: any) {
          console.error(
            '[HOOK DEBUG] erro de validação patch:',
            JSON.stringify(err.errors || err, null, 2)
          )
          throw new Error(
            'Falha na validação do patch: ' +
              JSON.stringify(err.errors || err)
          )
        }

        return context
      }
    ],
    remove: []
  },
  after: {
    all: [], find: [], get: [], create: [], update: [], patch: [], remove: []
  },
  error: {
    all: [], find: [], get: [], create: [], update: [], patch: [], remove: []
  }
}
