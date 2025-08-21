// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
// import { configPostgres } from './src/configuration'
require('dotenv').config();

const configPostgres = {
    "client": "pg",
    "connection": {
    "host": process.env.POSTGRES_HOST,
    "port": process.env.POSTGRES_PORT,
    "user": process.env.POSTGRES_USER,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB
  }
  } as const

// Load our database connection info from the app configuration
const config = configPostgres

module.exports = config
