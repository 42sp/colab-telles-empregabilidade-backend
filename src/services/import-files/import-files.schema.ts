// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ImportFilesService } from './import-files.class'

// Main data model schema
export const importFilesSchema = Type.Object(
  {
    id: Type.Number(),
    conversionMonth: Type.Optional(Type.String()),
    organizationName: Type.Optional(Type.String()),
    studentId: Type.Optional(Type.Number()),
    fullName: Type.Optional(Type.String()),
    university: Type.Optional(Type.String()),
    course: Type.Optional(Type.String()),
    targetAudience: Type.Optional(Type.String()),
    targetStatus: Type.Optional(Type.String()),
    graduationYear: Type.Optional(Type.Number()),
    registrationSource: Type.Optional(Type.String()),
    registrationDate: Type.Optional(Type.String()),
    opportunityType: Type.Optional(Type.String()),
    position: Type.Optional(Type.String()),
    details: Type.Optional(Type.String()),
    sectorArea: Type.Optional(Type.String()),
    career: Type.Optional(Type.String()),
    track: Type.Optional(Type.String()),
    organizationWebsite: Type.Optional(Type.String()),
    partnerCompany: Type.Optional(Type.Boolean()),
    topGlobalCompanies: Type.Optional(Type.Boolean()),
    opportunityStart: Type.Optional(Type.String()),
    opportunityEnd: Type.Optional(Type.String()),
    compensation: Type.Optional(Type.Number()),
    compensationSource: Type.Optional(Type.String()),
    ismartReferral: Type.Optional(Type.Boolean()),
    opportunityStatus: Type.Optional(Type.String()),
    comments: Type.Optional(Type.String()),
    tag: Type.Optional(Type.String()),
    featured: Type.Optional(Type.Boolean()),
    statusPriority: Type.Optional(Type.Number()),
    opportunityTypePriority: Type.Optional(Type.Number()),
    generalPriority: Type.Optional(Type.Number()),
    automaticVerificationFormula: Type.Optional(Type.String()),
    automaticVerification: Type.Optional(Type.Boolean()),
    timeValidation: Type.Optional(Type.Boolean())
  },
  { $id: 'ImportFiles' }
)
export type ImportFiles = Static<typeof importFilesSchema>
export const importFilesValidator = getValidator(importFilesSchema, dataValidator)
export const importFilesResolver = resolve<ImportFiles, HookContext<ImportFilesService>>({})

export const importFilesExternalResolver = resolve<ImportFiles, HookContext<ImportFilesService>>({})

// Schema for creating new entries
export const importFilesDataSchema = Type.Partial(importFilesSchema, {
  $id: 'ImportFilesData'
});
export type ImportFilesData = Static<typeof importFilesDataSchema>
export const importFilesDataValidator = getValidator(importFilesDataSchema, dataValidator)
export const importFilesDataResolver = resolve<ImportFiles, HookContext<ImportFilesService>>({})

// Schema for updating existing entries
export const importFilesPatchSchema = Type.Partial(importFilesSchema, {
  $id: 'ImportFilesPatch'
})
export type ImportFilesPatch = Static<typeof importFilesPatchSchema>
export const importFilesPatchValidator = getValidator(importFilesPatchSchema, dataValidator)
export const importFilesPatchResolver = resolve<ImportFiles, HookContext<ImportFilesService>>({})

// Schema for allowed query properties
export const importFilesQueryProperties = Type.Pick(importFilesSchema, ['id'])
export const importFilesQuerySchema = Type.Intersect(
  [
    querySyntax(importFilesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ImportFilesQuery = Static<typeof importFilesQuerySchema>
export const importFilesQueryValidator = getValidator(importFilesQuerySchema, queryValidator)
export const importFilesQueryResolver = resolve<ImportFilesQuery, HookContext<ImportFilesService>>({})
