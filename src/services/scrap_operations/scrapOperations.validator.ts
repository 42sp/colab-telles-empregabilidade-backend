import { getDataValidator } from '@feathersjs/typebox'
import { dataValidator } from '../../validators'
import { scrapOperationsDataSchema, scrapOperationsPatchSchema } from './scrapOperations.schema'

let scrapOperationsDataValidatorInstance: ReturnType<typeof getDataValidator> | undefined

export function getScrapOperationsDataValidator() {
  if (!scrapOperationsDataValidatorInstance) {
    scrapOperationsDataValidatorInstance = getDataValidator(
      {
        create: scrapOperationsDataSchema,
        update: scrapOperationsDataSchema,
        patch: scrapOperationsPatchSchema
      },
      dataValidator
    )
  }
  return scrapOperationsDataValidatorInstance
}
