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
  required: ['name', 'email', 'cpf', 'celphone','linkedin'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    cpf: { type: 'string' },
    celphone: { type: 'string' },
    linkedin: { type: 'string' },
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
  required: ['name', 'email', 'cpf', 'celphone','linkedin'],
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
  required: ['name', 'email', 'cpf', 'celphone','linkedin'],
  properties: {
    ...studentsSchema.properties
  }
} as const
export type StudentsPatch = FromSchema<typeof studentsPatchSchema>
export const studentsPatchValidator = getValidator(studentsPatchSchema, dataValidator)
export const studentsPatchResolver = resolve<StudentsPatch, HookContext<StudentsService>>({})

// Schema for allowed query properties
export const studentsQuerySchema = {
  $id: 'StudentsQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(studentsSchema.properties)
  }
} as const
export type StudentsQuery = FromSchema<typeof studentsQuerySchema>
export const studentsQueryValidator = getValidator(studentsQuerySchema, queryValidator)
export const studentsQueryResolver = resolve<StudentsQuery, HookContext<StudentsService>>({})
