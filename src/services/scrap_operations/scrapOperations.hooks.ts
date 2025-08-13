// scrapOperations.hooks.ts
import type { HookContext } from '@feathersjs/feathers'
import { getScrapOperationsDataValidator } from './scrapOperations.validator'

const scrapOperationsDataValidator = getScrapOperationsDataValidator()

export default {
  before: {
    create: [
      async (context: HookContext) => {
        // 1) Log dos dados que chegaram
        console.log('[HOOK DEBUG] payload recebido:', JSON.stringify(context.data, null, 2))

        // 2) Tenta validar e, em caso de erro, mostra detalhes
        try {
          await scrapOperationsDataValidator.create(context.data)
        } catch (err: any) {
          console.error('[HOOK DEBUG] erro de validação AJV:', JSON.stringify(err.errors || err, null, 2))
          // relança o erro para manter o fluxo do Feathers
          throw err
        }

        // 3) Injeta os defaults e segue
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
        console.log('[Hook] before.update - Validando dados')
        await scrapOperationsDataValidator.update(context.data)
        return context
      }
    ],
    patch: [
      async (context: HookContext) => {
        console.log('[Hook] before.patch - Validando dados')
        await scrapOperationsDataValidator.patch(context.data)
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
    patch: [],
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
