// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { LinkedinService } from './linkedin.class'

// Main data model schema
export const linkedinSchema = {
  $id: 'Linkedin',
  type: 'object',
  additionalProperties: true,
  required: ['id'],
  properties: {
    id: { type: 'string' }
  }
} as const
export type Linkedin = FromSchema<typeof linkedinSchema>
export const linkedinValidator = getValidator(linkedinSchema, dataValidator)
export const linkedinResolver = resolve<Linkedin, HookContext<LinkedinService>>({})

export const linkedinExternalResolver = resolve<Linkedin, HookContext<LinkedinService>>({})

// Schema for creating new data
export const linkedinDataSchema = {
  $id: 'LinkedinData',
  type: 'object',
  additionalProperties: true,
  required: [],
  properties: {
    ...linkedinSchema.properties
  }
} as const
export type LinkedinData = FromSchema<typeof linkedinDataSchema>
export const linkedinDataValidator = getValidator(linkedinDataSchema, dataValidator)
export const linkedinDataResolver = resolve<LinkedinData, HookContext<LinkedinService>>({})

// Schema for updating existing data
export const linkedinPatchSchema = {
  $id: 'LinkedinPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...linkedinSchema.properties
  }
} as const
export type LinkedinPatch = FromSchema<typeof linkedinPatchSchema>
export const linkedinPatchValidator = getValidator(linkedinPatchSchema, dataValidator)
export const linkedinPatchResolver = resolve<LinkedinPatch, HookContext<LinkedinService>>({})

// Schema for allowed query properties
export const linkedinQuerySchema = {
  $id: 'LinkedinQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(linkedinSchema.properties)
  }
} as const
export type LinkedinQuery = FromSchema<typeof linkedinQuerySchema>
export const linkedinQueryValidator = getValidator(linkedinQuerySchema, queryValidator)
export const linkedinQueryResolver = resolve<LinkedinQuery, HookContext<LinkedinService>>({})
