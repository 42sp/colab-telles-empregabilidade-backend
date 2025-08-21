import type { HookContext } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'
import { TSchema } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

export const validateData = (schema: TSchema) => {
  const C = TypeCompiler.Compile(schema)
  return (context: HookContext) => {
    if (!C.Check(context.data)) {
      const errors = [...C.Errors(context.data)]
      throw new BadRequest('Dados inválidos', {
        errors: errors.map(error => ({
          path: error.path,
          message: error.message
        }))
      })
    }
    return context
  }
}