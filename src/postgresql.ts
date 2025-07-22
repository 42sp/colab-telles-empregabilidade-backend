// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import knex from 'knex'
import type { Knex } from 'knex'
import type { Application } from './declarations'

declare module './declarations' {
  interface Configuration {
    postgresqlClient: Knex
  }
}

export const postgresql = (app: Application) => {
  const config = {
    "client": "pg",
    "connection": {
    "host": process.env.POSTGRES_HOST,
    "port": process.env.POSTGRES_PORT,
    "user": process.env.POSTGRES_USER,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB
  }
  } as any
  const db = knex(config!)

  app.set('postgresqlClient', db)
}
