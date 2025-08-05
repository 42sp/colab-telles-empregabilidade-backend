import { getDataValidator } from '@feathersjs/typebox'
import { dataValidator } from '../../validators'
import {
  scrapOperationsDataSchema,
  scrapOperationsPatchSchema
} from './scrapOperations.schema'

let scrapOperationsDataValidatorInstance: ReturnType<typeof getDataValidator> | undefined;

export function getScrapOperationsDataValidator() {
  console.log('[Validator] Arquivo carregado de:', __filename)
  if (!scrapOperationsDataValidatorInstance) {
    console.log('[Validator] Criando nova instância de scrapOperationsDataValidator')
    scrapOperationsDataValidatorInstance = getDataValidator(
      {
        create: scrapOperationsDataSchema,
        update: scrapOperationsDataSchema,
        patch: scrapOperationsPatchSchema
      },
      dataValidator
    )
  } else {
    console.log('[Validator] Usando instância já criada de scrapOperationsDataValidator')
  }
  return scrapOperationsDataValidatorInstance
}
