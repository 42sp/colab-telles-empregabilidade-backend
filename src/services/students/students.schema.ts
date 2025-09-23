// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { StudentsService } from './students.class'

// Main data model schema
export const studentsSchema = {
  $id: 'Students',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'email', 'cpf', 'celphone', 'linkedin'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    cpf: { type: 'string' },
    celphone: { type: 'string' },
    linkedin: { type: 'string' },
    holderContractStatus: { type: 'string' },
    socialName: { type: 'string' },
    preferredName: { type: 'string' },
    ismartEmail: { type: 'string' },
    phoneNumber: { type: 'string' },
    gender: { type: 'string' },
    sexualOrientation: { type: 'string' },
    raceEthnicity: { type: 'string' },
    hasDisability: { type: 'boolean' },
    transferredCourseOrUniversity: { type: 'boolean' },
    transferDate: { type: 'string' },
    currentCourseStart: { type: 'string' },
    currentCourseStartYear: { type: 'number' },
    currentCourseEnd: { type: 'string' },
    currentCourseEndYear: { type: 'number' },
    supportedCourseFormula: { type: 'string' },
    currentArea: { type: 'string' },
    universityType: { type: 'string' },
    currentAggregatedCourse: { type: 'string' },
    currentDetailedCourse: { type: 'string' },
    currentDetailedUniversity: { type: 'string' },
    currentCity: { type: 'string' },
    currentState: { type: 'string' },
    currentCountry: { type: 'string' },
    currentAggregatedLocation: { type: 'string' },
    currentShift: { type: 'string' },
    realStatus: { type: 'string' },
    realProfile: { type: 'string' },
    hrProfile: { type: 'string' },
    targetStatus: { type: 'string' },
    entryProgram: { type: 'string' },
    projectYears: { type: 'number' },
    entryYearClass: { type: 'string' },
    schoolNetwork: { type: 'string' },
    school: { type: 'string' },
    standardizedSchool: { type: 'string' },
    groupedLocation: { type: 'string' },
    specificLocation: { type: 'string' },
    duplicatedTargetStatus: { type: 'string' },
    duplicatedCurrentStatus: { type: 'string' },
    targetAudience: { type: 'string' },
    working: { type: 'boolean' },
    opportunityType: { type: 'string' },
    details: { type: 'string' },
    sector: { type: 'string' },
    careerTrack: { type: 'string' },
    organization: { type: 'string' },
    website: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    compensation: { type: 'string' },
    partnerCompanies: { type: 'string' },
    topGlobalCompanies: { type: 'string' },
    comments: { type: 'string' },
    tag: { type: 'string' },
    jan: { type: 'string' },
    feb: { type: 'string' },
    mar: { type: 'string' },
    apr: { type: 'string' },
    may: { type: 'string' },
    jun: { type: 'string' },
    jul: { type: 'string' },
    aug: { type: 'string' },
    sep: { type: 'string' },
    oct: { type: 'string' },
    nov: { type: 'string' },
    dec: { type: 'string' },
    january: { type: 'string' },
    february: { type: 'string' },
    march: { type: 'string' },
    april: { type: 'string' },
    mayFull: { type: 'string' },
    june: { type: 'string' },
    july: { type: 'string' },
    august: { type: 'string' },
    september: { type: 'string' },
    october: { type: 'string' },
    november: { type: 'string' },
    december: { type: 'string' },
    january2: { type: 'string' },
    february2: { type: 'string' },
    march2: { type: 'string' },
    april2: { type: 'string' },
    may2: { type: 'string' },
    june2: { type: 'string' },
    july2: { type: 'string' },
    august2: { type: 'string' },
    september2: { type: 'string' },
    october2: { type: 'string' },
    november2: { type: 'string' },
    december2: { type: 'string' },
    internshipUnavailabilityReason: { type: 'string' },
    careerTrajectoryInterests: { type: 'string' },
    primaryInterest: { type: 'string' },
    secondaryInterest: { type: 'string' },
    intendedWorkingAreas: { type: 'string' },
    additionalAreaInterests: { type: 'string' },
    seekingProfessionalOpportunity: { type: 'string' },
    opportunitiesLookingFor: { type: 'string' },
    opportunityDetails: { type: 'string' },
    languages: { type: 'string' },
    technicalKnowledge: { type: 'string' },
    officePackageKnowledge: { type: 'string' },
    wordProficiencyLevel: { type: 'string' },
    excelProficiencyLevel: { type: 'string' },
    powerPointProficiencyLevel: { type: 'string' }
  }
} as const
export type Students = FromSchema<typeof studentsSchema>
export const studentsValidator = getValidator(studentsSchema, dataValidator)
export const studentsResolver = resolve<Students, HookContext<StudentsService>>({})

export const studentsExternalResolver = resolve<Students, HookContext<StudentsService>>({})

// Schema for creating new data
export const studentsDataSchema = {
  $id: 'StudentsData',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'email', 'cpf', 'celphone', 'linkedin'],
  properties: {
    ...studentsSchema.properties
  }
} as const
export type StudentsData = FromSchema<typeof studentsDataSchema>
export const studentsDataValidator = getValidator(studentsDataSchema, dataValidator)
export const studentsDataResolver = resolve<StudentsData, HookContext<StudentsService>>({})

// Schema for updating existing data
export const studentsPatchSchema = {
  $id: 'StudentsPatch',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'email', 'cpf', 'celphone', 'linkedin'],
  properties: {
    ...studentsSchema.properties
  }
} as const
export type StudentsPatch = FromSchema<typeof studentsPatchSchema>
export const studentsPatchValidator = getValidator(studentsPatchSchema, dataValidator)
export const studentsPatchResolver = resolve<StudentsPatch, HookContext<StudentsService>>({})

export const studentsQuerySchema = {
  $id: 'StudentsQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(
      studentsSchema.properties,
      Object.fromEntries(
        Object.entries(studentsSchema.properties).map(([key, value]) => {
          if (value.type === 'string') {
            // Campos string: $ilike, $like, $in
            return [key, { $ilike: true, $like: true, $in: true }];
          } else if (value.type === 'number') {
            // Campos number: $eq, $in
            return [key, { $eq: true, $in: true }];
          } else if (value.type === 'boolean') {
            // Campos boolean: $eq
            return [key, { $eq: true }];
          }
          return [key, {}]; // fallback
        })
      )
    )
  }
} as const;
export type StudentsQuery = FromSchema<typeof studentsQuerySchema>
export const studentsQueryValidator = getValidator(studentsQuerySchema, queryValidator)
export const studentsQueryResolver = resolve<StudentsQuery, HookContext<StudentsService>>({})
