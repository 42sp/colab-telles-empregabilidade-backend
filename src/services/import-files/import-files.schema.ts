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
		xls_id: Type.Optional(Type.Number()),
		name: Type.String(),
		socialName: Type.Optional(Type.String()),
		preferredName: Type.Optional(Type.String()),
		ismartEmail: Type.String(),
		phoneNumber: Type.String(),
		gender: Type.String(),
		sexualOrientation: Type.Optional(Type.String()),
		raceEthnicity: Type.Optional(Type.String()),
		hasDisability: Type.Optional(Type.Boolean()),
		linkedin: Type.Optional(Type.String()),
		transferredCourseOrUniversity: Type.Optional(Type.Boolean()),
		transferDate: Type.Optional(Type.String()), // date as string
		currentCourseStart: Type.String(),
		currentCourseStartYear: Type.Number(),
		currentCourseEnd: Type.String(),
		currentCourseEndYear: Type.Number(),
		supportedCourseFormula: Type.String(),
		currentArea: Type.String(),
		universityType: Type.String(),
		currentAggregatedCourse: Type.String(),
		currentDetailedCourse: Type.String(),
		currentDetailedUniversity: Type.String(),
		currentCity: Type.String(),
		currentState: Type.String(),
		currentCountry: Type.String(),
		currentAggregatedLocation: Type.String(),
		currentShift: Type.String(),
		holderContractStatus: Type.String(),
		realStatus: Type.String(),
		realProfile: Type.String(),
		hrProfile: Type.String(),
		targetStatus: Type.String(),
		entryProgram: Type.String(),
		projectYears: Type.Number(),
		entryYearClass: Type.String(),
		schoolNetwork: Type.String(),
		school: Type.String(),
		standardizedSchool: Type.String(),
		groupedLocation: Type.String(),
		specificLocation: Type.String(),
		duplicatedTargetStatus: Type.String(),
		duplicatedCurrentStatus: Type.String(),
		targetAudience: Type.String(),
		working: Type.Boolean(),
		opportunityType: Type.Optional(Type.String()),
		details: Type.Optional(Type.String()),
		sector: Type.Optional(Type.String()),
		careerTrack: Type.Optional(Type.String()),
		organization: Type.Optional(Type.String()),
		website: Type.Optional(Type.String()),
		startDate: Type.Optional(Type.String()), // date as string
		endDate: Type.Optional(Type.String()), // date as string
		compensation: Type.Optional(Type.Number()),
		partnerCompanies: Type.Optional(Type.Boolean()),
		topGlobalCompanies: Type.Optional(Type.Boolean()),
		comments: Type.Optional(Type.String()),
		tag: Type.Optional(Type.String()),
		jan: Type.Optional(Type.String()),
		feb: Type.Optional(Type.String()),
		mar: Type.Optional(Type.String()),
		apr: Type.Optional(Type.String()),
		may: Type.Optional(Type.String()),
		jun: Type.Optional(Type.String()),
		jul: Type.Optional(Type.String()),
		aug: Type.Optional(Type.String()),
		sep: Type.Optional(Type.String()),
		oct: Type.Optional(Type.String()),
		nov: Type.Optional(Type.String()),
		dec: Type.Optional(Type.String()),
		january: Type.Optional(Type.String()),
		february: Type.Optional(Type.String()),
		march: Type.Optional(Type.String()),
		april: Type.Optional(Type.String()),
		mayFull: Type.Optional(Type.String()),
		june: Type.Optional(Type.String()),
		july: Type.Optional(Type.String()),
		august: Type.Optional(Type.String()),
		september: Type.Optional(Type.String()),
		october: Type.Optional(Type.String()),
		november: Type.Optional(Type.String()),
		december: Type.Optional(Type.String()),
		january2: Type.Optional(Type.String()),
		february2: Type.Optional(Type.String()),
		march2: Type.Optional(Type.String()),
		april2: Type.Optional(Type.String()),
		may2: Type.Optional(Type.String()),
		june2: Type.Optional(Type.String()),
		july2: Type.Optional(Type.String()),
		august2: Type.Optional(Type.String()),
		september2: Type.Optional(Type.String()),
		october2: Type.Optional(Type.String()),
		november2: Type.Optional(Type.String()),
		december2: Type.Optional(Type.String()),
		internshipUnavailabilityReason: Type.Optional(Type.String()),
		careerTrajectoryInterests: Type.Optional(Type.Array(Type.String())),
		primaryInterest: Type.Optional(Type.String()),
		secondaryInterest: Type.Optional(Type.String()),
		intendedWorkingAreas: Type.Optional(Type.Array(Type.String())),
		additionalAreaInterests: Type.Optional(Type.String()),
		seekingProfessionalOpportunity: Type.Optional(Type.Boolean()),
		opportunitiesLookingFor: Type.Optional(Type.Array(Type.String())),
		opportunityDetails: Type.Optional(Type.String()),
		languages: Type.Optional(Type.Array(Type.String())),
		technicalKnowledge: Type.Optional(Type.Array(Type.String())),
		officePackageKnowledge: Type.Optional(Type.Boolean()),
		wordProficiencyLevel: Type.Optional(Type.String()),
		excelProficiencyLevel: Type.Optional(Type.String()),
		powerPointProficiencyLevel: Type.Optional(Type.String()),
		importedFilesId: Type.Optional(Type.Number()),
		createdAt: Type.String(), // timestamp as string
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
