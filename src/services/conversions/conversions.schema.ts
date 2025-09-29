// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ConversionsService } from './conversions.class'

// Main data model schema
export const conversionsSchema = Type.Object({
	// Conversion Identification
	conversionMonth: Type.String(),
	studentId: Type.String(),
	fullName: Type.String(),

	// Student Academic Data
	university: Type.String(),
	course: Type.String(),
	targetAudience: Type.String(),
	targetStatus: Type.String(),
	graduationYear: Type.Number(),

	// Conversion Registration
	registrationSource: Type.String(),
	registrationDate: Type.String({ format: 'date-time' }),

	// Opportunity Details
	opportunityType: Type.String(), // internship, job, trainee, etc.
	position: Type.String(),
	details: Type.Optional(Type.String()),
	sectorArea: Type.String(),
	career: Type.String(),
	track: Type.String(),

	// Organization Information
	organizationName: Type.Optional(Type.String()),
	organizationWebsite: Type.Optional(Type.String()),
	partnerCompany: Type.Boolean(),
	topGlobalCompanies: Type.Boolean(),

	// Period and Compensation
	opportunityStart: Type.String({ format: 'date-time' }),
	opportunityEnd: Type.Optional(Type.String({ format: 'date-time' })),
	compensation: Type.Optional(Type.Number()),
	compensationSource: Type.Optional(Type.String()),

	// Ismart Tracking
	ismartReferral: Type.Boolean(),
	opportunityStatus: Type.String(),
	comments: Type.Optional(Type.String()),
	tag: Type.Optional(Type.String()),
	featured: Type.Boolean(),

	// Prioritization and Validation
	statusPriority: Type.Number(),
	opportunityTypePriority: Type.Number(),
	generalPriority: Type.Number(),
	automaticVerificationFormula: Type.Optional(Type.String()),
	automaticVerification: Type.Boolean(),
	timeValidation: Type.Boolean(),

	importedFilesId: Type.Optional(Type.Number())
}, {
	$id: 'Conversions',
	additionalProperties: false
})

export type Conversions = Static<typeof conversionsSchema>
export const conversionsValidator = getValidator(conversionsSchema, dataValidator)
export const conversionsResolver = resolve<Conversions, HookContext<ConversionsService>>({})

export const conversionsExternalResolver = resolve<Conversions, HookContext<ConversionsService>>({})

// Schema for creating new entries
export const conversionsDataSchema = Type.Object(
  { ...conversionsSchema.properties },
  {
	$id: 'ConversionsData',
	additionalProperties: false
  }
)
export type ConversionsData = Static<typeof conversionsDataSchema>
export const conversionsDataValidator = getValidator(conversionsDataSchema, dataValidator)
export const conversionsDataResolver = resolve<Conversions, HookContext<ConversionsService>>({})

// Schema for updating existing entries
export const conversionsPatchSchema = Type.Partial(conversionsSchema, {
  $id: 'ConversionsPatch'
})
export type ConversionsPatch = Static<typeof conversionsPatchSchema>
export const conversionsPatchValidator = getValidator(conversionsPatchSchema, dataValidator)
export const conversionsPatchResolver = resolve<Conversions, HookContext<ConversionsService>>({})

// Schema for allowed query properties
export const conversionsQueryProperties = {
  conversionMonth: Type.String(),
  studentId: Type.String(),
  fullName: Type.String(),
  // Add more properties as needed for querying
}
export const conversionsQuerySchema = Type.Intersect(
  [
	querySyntax(Type.Object(conversionsQueryProperties)),
	// Add additional query properties here
	Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ConversionsQuery = Static<typeof conversionsQuerySchema>
export const conversionsQueryValidator = getValidator(conversionsQuerySchema, queryValidator)
export const conversionsQueryResolver = resolve<ConversionsQuery, HookContext<ConversionsService>>({})
