import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
  // Níveis de Debug - Mostra o nível selecionado e todos acima dele na lista
  //   error  → sempre mostrar
  //   warn   → só aparece se level <= warn
  //   info   → só aparece se level <= info
  //   http   → idem (se configurado)
  //   verbose
  //   debug
  //   silly  → logs mais detalhados
  level: process.env.LOG_LEVEL || 'debug',
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
    })
  ),
  transports: [new transports.Console()]
})
