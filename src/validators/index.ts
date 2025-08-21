import { Ajv, addFormats } from '@feathersjs/schema'
import type { FormatsPluginOptions } from '@feathersjs/schema'

// Configuração de formatos suportados
const formats: FormatsPluginOptions = [
  'date-time', 
  'time', 
  'date', 
  'email',  
  'hostname', 
  'ipv4', 
  'ipv6',
  'uri',
  'uri-reference',
  'uuid',
  'uri-template',
  'json-pointer',
  'relative-json-pointer',
  'regex'
]

// Validador principal para dados
export const dataValidator = addFormats(new Ajv({}), formats)

// Validador para queries (com coerção de tipos)
export const queryValidator = addFormats(
  new Ajv({
    coerceTypes: true
  }),
  formats
)