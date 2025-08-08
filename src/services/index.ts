import { students } from './students/students'
import { user } from './users/users'
import { scrapOperations } from './scrap_operations/scrapOperations'

// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(students)
  app.configure(user)
  app.configure(scrapOperations)
}
