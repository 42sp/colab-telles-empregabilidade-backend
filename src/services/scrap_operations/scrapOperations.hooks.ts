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
        // 1. Captura source/user do data OU dos params
        const source =
          context.data?._source ||
          context.params?.source ||
          context.params?.query?.$source ||
          'unknown'

        const user =
          context.data?._user ||
          context.params?.user ||
          context.params?.headers?.user ||
          'anonymous'

        //console.log('[HOOK before.patch] capturado:', { source, user })

        // 2. Remove campos de controle do payload (não vão para o DB)
        if ('_source' in context.data) delete context.data._source
        if ('_user' in context.data) delete context.data._user

        // 3. Lista de campos permitidos para persistir
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
          Object.entries(context.data).filter(([key]) =>
            allowedFields.includes(key)
          )
        )

        // 4. Ajusta scheduled_date se vier com timestamp
        if (context.data.scheduled_date?.includes('T')) {
          context.data.scheduled_date = context.data.scheduled_date.split('T')[0]
        }

        // 5. Validação
        try {
          const validator =
            (await import('./scrapOperations.validator')).getScrapOperationsDataValidator()
          await validator.patch(context.data)
        } catch (err: any) {
          throw new Error(
            'Falha na validação do patch: ' + JSON.stringify(err.errors || err)
          )
        }

        // 6. Injeta novamente em params (não vai pro banco)
        context.params = {
          ...context.params,
          source,
          user
        }
        //console.log('[TEST before.patch] context.params:', context.params)
        //console.log('[TEST before.patch] context.data:', context.data)
        //console.log(
        //  '[HOOK before.patch] context.params.source:',
        //  context.params?.source
        //)
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
        const user = context.params?.user || 'anonymous'

        // Garante que _source/_user vão no payload do WS (não no banco)
        context.dispatch = { ...result, _source: source, _user: user }

        //console.log('[TEST after.patch] context.result:', context.result)
        //console.log(
        //   '[TEST after.patch] context.params.source:',
        //   context.params?.source
        // )
        // console.log(
        //   '[HOOK after.patch] Enviando dispatch com _source:',
        //   context.dispatch
        // )

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
