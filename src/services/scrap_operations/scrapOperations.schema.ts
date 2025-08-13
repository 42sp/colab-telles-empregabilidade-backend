import { querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { Type } from '@feathersjs/typebox'

// Schema completo de um registro da tabela scrap_operations
export const scrapOperationsSchema = Type.Object(
  {
    id: Type.Number(),
    uuid: Type.Optional(Type.String({ format: 'uuid' })),
    name: Type.String(),
    type: Type.Optional(Type.String()),
    status: Type.Union([
      Type.Literal('Agendado'),
      Type.Literal('Em Execução'),
      Type.Literal('Concluído'),
      Type.Literal('Falha')
    ]),
    user_tag: Type.String(),
    scheduled_date: Type.String({ format: 'date' }),
    scheduled_time: Type.String(),
    repeat_days: Type.Optional(Type.String()),
    repeat_time: Type.Optional(Type.String()),
    started_at: Type.Optional(Type.String({ format: 'date-time' })),
    finished_at: Type.Optional(Type.String({ format: 'date-time' })),
    result: Type.Optional(Type.Object({})),
    error_message: Type.Optional(Type.String())
  },
  { additionalProperties: false }
)

export type ScrapOperations = Static<typeof scrapOperationsSchema>

// Gera o tipo TypeScript baseado no schema
export const scrapOperationsQueryProperties = Type.Pick(scrapOperationsSchema, [
  'id',
  'uuid',
  'name',
  'status',
  'user_tag',
  'scheduled_date',
  'type',
  'started_at',
  'repeat_days',
  'repeat_time'
])

// Define os campos que podem ser usados em filtros (ex: /find)
export const scrapOperationsQuerySchema = Type.Intersect(
  [querySyntax(scrapOperationsQueryProperties), Type.Object({}, { additionalProperties: false })],
  { additionalProperties: false }
)

// Gera o tipo TypeScript para a query
export type ScrapOperationsQuery = Static<typeof scrapOperationsQuerySchema>

// Define o schema para os dados de criação e atualização
export const scrapOperationsDataSchema = Type.Intersect([
  Type.Pick(scrapOperationsSchema, ['name', 'user_tag', 'scheduled_date', 'scheduled_time', 'type']),
  Type.Partial(Type.Pick(scrapOperationsSchema, ['repeat_days', 'repeat_time']))
])
export type ScrapOperationsData = Static<typeof scrapOperationsDataSchema>

export const scrapOperationsPatchSchema = Type.Partial(scrapOperationsDataSchema, {
  additionalProperties: false
})

export type ScrapOperationsPatch = Static<typeof scrapOperationsPatchSchema>
