import { querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { Type } from '@feathersjs/typebox'

// Schema completo de um registro da tabela scrap_operations
export const scrapOperationsSchema = Type.Object(
  {
    // ------------------------------
    // 🔹 Identificação
    // ------------------------------
    id: Type.Number(), /** Identificador único da operação (PK) */
    uuid: Type.Optional(Type.String({ format: 'uuid' })), /** UUID da operação */
    name: Type.String(), /** Nome da operação */
    type: Type.Optional(Type.String()), /** Tipo da operação */
    status: Type.Union([
      Type.Literal('Agendado'),
      Type.Literal('Em Execução'),
      Type.Literal('Concluído'),
      Type.Literal('Falha')
    ]), /** Status atual da operação */
    user_tag: Type.String(), /** Identificação do usuário que solicitou */

    // ------------------------------
    // 🔹 Agendamento
    // ------------------------------
    scheduled_date: Type.String({ format: 'date' }), /** Data agendada */
    scheduled_time: Type.String(), /** Hora agendada */
    repeat_days: Type.Optional(Type.Union([Type.String(), Type.Null()])), /** Dias para a repetição */
    repeat_time: Type.Optional(Type.Union([Type.String(), Type.Null()])), /** Hora da repetição */

    // ------------------------------
    // 🔹 Auditoria e Controle
    // ------------------------------
    created_by: Type.Optional(Type.String()), /** Usuário que criou */
    created_at: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])), /** Data da criação */
    deleted: Type.Optional(Type.Boolean({ default: false })), /** Flag de deleção */
    deleted_by: Type.Optional(Type.Union([Type.String(), Type.Null()])), /** Usuário que deletou */
    deleted_at: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])), /** Data da deleção */
    last_edited_by: Type.Optional(Type.Union([Type.String(), Type.Null()])), /** Último usuário que editou */
    last_edited_at: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])), /** Data da última edição */

    // ------------------------------
    // 🔹 Execução e Resultado
    // ------------------------------
    started_at: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])), /** Data/hora de início da execução */
    finished_at: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])), /** Data/hora de término */
    result: Type.Optional(Type.Union([Type.Object({}, { additionalProperties: true }), Type.Null()])), /** Resultado da operação */
    error_message: Type.Optional(Type.Union([Type.String(), Type.Null()])), /** Mensagem de erro em caso de falha */

    // ------------------------------
    // 🔹 Condições para scraping
    // ------------------------------
    target_conditions: Type.Optional(
      Type.Array(
        Type.Object({
          field: Type.String(),
          value: Type.String()
        })
      )
    ), /** Condições para filtrar dados no scraper */
  },
  { additionalProperties: false }
)

export type ScrapOperations = Static<typeof scrapOperationsSchema>

// ------------------------------
// 🔹 Query Properties
// ------------------------------
export const scrapOperationsQueryProperties = Type.Pick(scrapOperationsSchema, [
  'id',
  'uuid',
  'name',
  'type',
  'status',
  'user_tag',
  'scheduled_date',
  'scheduled_time',
  'repeat_days',
  'repeat_time',
  'created_by',
  'created_at',
  'deleted',
  'deleted_by',
  'deleted_at',
  'last_edited_by',
  'last_edited_at',
  'started_at',
  'finished_at',
  'result',
  'error_message',
  'target_conditions'
])

export const scrapOperationsQuerySchema = Type.Intersect(
  [querySyntax(scrapOperationsQueryProperties), Type.Object({}, { additionalProperties: false })],
  { additionalProperties: false }
)

export type ScrapOperationsQuery = Static<typeof scrapOperationsQuerySchema>

// ------------------------------
// 🔹 Dados para criação
// ------------------------------
export const scrapOperationsDataSchema = Type.Intersect([
  Type.Pick(scrapOperationsSchema, [
    'name',
    'user_tag',
    'scheduled_date',
    'scheduled_time',
    'type',
    'created_by',
    'target_conditions'
  ]),
  Type.Partial(Type.Pick(scrapOperationsSchema, ['repeat_days', 'repeat_time']))
])

export type ScrapOperationsData = Static<typeof scrapOperationsDataSchema>

// ------------------------------
// 🔹 Dados para atualização
// ------------------------------
export const scrapOperationsPatchSchema = Type.Partial(
  Type.Pick(scrapOperationsSchema, [
    'id',
    'uuid',
    'name',
    'type',
    'status',
    'user_tag',
    'scheduled_date',
    'scheduled_time',
    'repeat_days',
    'repeat_time',
    'created_by',
    'created_at',
    'deleted_at',
    'deleted_by',
    'deleted',
    'last_edited_by',
    'last_edited_at',
    'started_at',
    'finished_at',
    'result',
    'error_message',
    'target_conditions'
  ]),
  { additionalProperties: false }
)

export type ScrapOperationsPatch = Static<typeof scrapOperationsPatchSchema>
