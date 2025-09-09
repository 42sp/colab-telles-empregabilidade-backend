// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { GlassdoorService } from './glassdoor.class'

// Main data model schema
export const glassdoorSchema = {
  $id: 'Glassdoor',
  type: 'object',
  additionalProperties: true,
  required: ['id'],
  properties: {
		id: { type: 'string' },
    company: { type: 'string' },
    country_code: { type: 'string' },
		salaries_count: { type: 'number' },
		company_type: { type: 'string' },
		region: { type: 'string' }
  }
} as const
export type Glassdoor = FromSchema<typeof glassdoorSchema>
export const glassdoorValidator = getValidator(glassdoorSchema, dataValidator)
export const glassdoorResolver = resolve<Glassdoor, HookContext<GlassdoorService>>({})

export const glassdoorExternalResolver = resolve<Glassdoor, HookContext<GlassdoorService>>({})

// Schema for creating new data
export const glassdoorDataSchema = {
  $id: 'GlassdoorData',
  type: 'object',
  additionalProperties: true,
  properties: {
    ...glassdoorSchema.properties
  }
} as const
export type GlassdoorData = FromSchema<typeof glassdoorDataSchema>
export const glassdoorDataValidator = getValidator(glassdoorDataSchema, dataValidator)
export const glassdoorDataResolver = resolve<GlassdoorData, HookContext<GlassdoorService>>({
	test: () => undefined
})

// Schema for updating existing data
export const glassdoorPatchSchema = {
  $id: 'GlassdoorPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...glassdoorSchema.properties
  }
} as const
export type GlassdoorPatch = FromSchema<typeof glassdoorPatchSchema>
export const glassdoorPatchValidator = getValidator(glassdoorPatchSchema, dataValidator)
export const glassdoorPatchResolver = resolve<GlassdoorPatch, HookContext<GlassdoorService>>({})

// Schema for allowed query properties
export const glassdoorQuerySchema = {
  $id: 'GlassdoorQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(glassdoorSchema.properties)
  }
} as const
export type GlassdoorQuery = FromSchema<typeof glassdoorQuerySchema>
export const glassdoorQueryValidator = getValidator(glassdoorQuerySchema, queryValidator)
export const glassdoorQueryResolver = resolve<GlassdoorQuery, HookContext<GlassdoorService>>({})
