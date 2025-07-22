// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import { configPostgres } from './src/configuration'

// Load our database connection info from the app configuration
const config = configPostgres

module.exports = config
