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
		name: Type.Optional(Type.String()),
		socialName: Type.Optional(Type.String()),
		preferredName: Type.Optional(Type.String()),
		ismartEmail: Type.Optional(Type.String()),
		phoneNumber: Type.Optional(Type.String()),
		gender: Type.Optional(Type.String()),
		sexualOrientation: Type.Optional(Type.String()),
		raceEthnicity: Type.Optional(Type.String()),
		hasDisability: Type.Optional(Type.Boolean()),
		linkedin: Type.Optional(Type.String()),
		transferredCourseOrUniversity: Type.Optional(Type.Boolean()),
		transferDate: Type.Optional(Type.String()), // date as string
		currentCourseStart: Type.Optional(Type.String()),
		currentCourseStartYear: Type.Optional(Type.Number()),
		currentCourseEnd: Type.Optional(Type.String()),
		currentCourseEndYear: Type.Optional(Type.Number()),
		supportedCourseFormula: Type.Optional(Type.String()),
		currentArea: Type.Optional(Type.String()),
		universityType: Type.Optional(Type.String()),
		currentAggregatedCourse: Type.Optional(Type.String()),
		currentDetailedCourse: Type.Optional(Type.String()),
		currentDetailedUniversity: Type.Optional(Type.String()),
		currentCity: Type.Optional(Type.String()),
		currentState: Type.Optional(Type.String()),
		currentCountry: Type.Optional(Type.String()),
		currentAggregatedLocation: Type.Optional(Type.String()),
		currentShift: Type.Optional(Type.String()),
		holderContractStatus: Type.Optional(Type.String()),
		realStatus: Type.Optional(Type.String()),
		realProfile: Type.Optional(Type.String()),
		hrProfile: Type.Optional(Type.String()),
		targetStatus: Type.Optional(Type.String()),
		entryProgram: Type.Optional(Type.String()),
		projectYears: Type.Optional(Type.Number()),
		entryYearClass: Type.Optional(Type.String()),
		schoolNetwork: Type.Optional(Type.String()),
		school: Type.Optional(Type.String()),
		standardizedSchool: Type.Optional(Type.String()),
		groupedLocation: Type.Optional(Type.String()),
		specificLocation: Type.Optional(Type.String()),
		duplicatedTargetStatus: Type.Optional(Type.String()),
		duplicatedCurrentStatus: Type.Optional(Type.String()),
		targetAudience: Type.Optional(Type.String()),
		working: Type.Optional(Type.Boolean()),
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
		createdAt: Type.Optional(Type.String()), // timestamp as string
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
