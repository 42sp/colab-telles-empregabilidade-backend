import { querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { Type } from '@feathersjs/typebox'


// Schema completo de um registro da tabela scrap_operations
export const scrapOperationsSchema = Type.Object(
  {
    id: Type.Number(),
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
    started_at: Type.Optional(Type.String({ format: 'date-time' })),
    finished_at: Type.Optional(Type.String({ format: 'date-time' })),
    result: Type.Optional(Type.Object({})),
    error_message: Type.Optional(Type.String())
  },
  {additionalProperties: false }
)

export type ScrapOperations = Static<typeof scrapOperationsSchema>

// Gera o tipo TypeScript baseado no schema
export const scrapOperationsQueryProperties = Type.Pick(scrapOperationsSchema, [
  'id',
  'name',
  'status',
  'user_tag',
  'scheduled_date',
  'type',
  'started_at'
])

// Define os campos que podem ser usados em filtros (ex: /find)
export const scrapOperationsQuerySchema = Type.Intersect(
  [
    querySyntax(scrapOperationsQueryProperties),
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)

// Gera o tipo TypeScript para a query
export type ScrapOperationsQuery = Static<typeof scrapOperationsQuerySchema>

// Define o schema para os dados de criação e atualização
export const scrapOperationsDataSchema = Type.Pick(
  scrapOperationsSchema,
  ['name', 'user_tag', 'scheduled_date', 'scheduled_time', 'type']
)
export type ScrapOperationsData = Static<typeof scrapOperationsDataSchema>


export const scrapOperationsPatchSchema = Type.Partial(scrapOperationsDataSchema, {
  additionalProperties: false
})

export type ScrapOperationsPatch = Static<typeof scrapOperationsPatchSchema>
