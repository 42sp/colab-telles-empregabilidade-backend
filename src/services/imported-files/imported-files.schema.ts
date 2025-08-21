// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ImportedFilesService } from './imported-files.class'

// Main data model schema
export const importedFilesSchema = {
  $id: 'ImportedFiles',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'fileName', 'importationDate', 'userId'],
  properties: {
    id: { type: 'number' },
		fileName: { type: 'string' },
		importationDate: { type: 'string', format: 'date-time' },
		userId: { type: 'string' }
  }
} as const
export type ImportedFiles = FromSchema<typeof importedFilesSchema>
export const importedFilesValidator = getValidator(importedFilesSchema, dataValidator)
export const importedFilesResolver = resolve<ImportedFiles, HookContext<ImportedFilesService>>({})

export const importedFilesExternalResolver = resolve<ImportedFiles, HookContext<ImportedFilesService>>({})

// Schema for creating new data
export const importedFilesDataSchema = {
  $id: 'ImportedFilesData',
  type: 'object',
  additionalProperties: false,
  required: ['fileName', 'importationDate', 'userId'],
  properties: {
    ...importedFilesSchema.properties
  }
} as const
export type ImportedFilesData = FromSchema<typeof importedFilesDataSchema>
export const importedFilesDataValidator = getValidator(importedFilesDataSchema, dataValidator)
export const importedFilesDataResolver = resolve<ImportedFilesData, HookContext<ImportedFilesService>>({})

// Schema for updating existing data
export const importedFilesPatchSchema = {
  $id: 'ImportedFilesPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...importedFilesSchema.properties
  }
} as const
export type ImportedFilesPatch = FromSchema<typeof importedFilesPatchSchema>
export const importedFilesPatchValidator = getValidator(importedFilesPatchSchema, dataValidator)
export const importedFilesPatchResolver = resolve<ImportedFilesPatch, HookContext<ImportedFilesService>>({})

// Schema for allowed query properties
export const importedFilesQuerySchema = {
  $id: 'ImportedFilesQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(importedFilesSchema.properties)
  }
} as const
export type ImportedFilesQuery = FromSchema<typeof importedFilesQuerySchema>
export const importedFilesQueryValidator = getValidator(importedFilesQuerySchema, queryValidator)
export const importedFilesQueryResolver = resolve<ImportedFilesQuery, HookContext<ImportedFilesService>>({})
