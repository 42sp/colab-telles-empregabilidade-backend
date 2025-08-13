import { importFiles } from './import-files/import-files'
import { conversions } from './conversions/conversions'
import { students } from './students/students'
import { user } from './users/users'
import { scrapOperations } from './scrap_operations/scrapOperations'

// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(importFiles)
  app.configure(conversions)
  app.configure(students)
  app.configure(user)
  app.configure(scrapOperations)
}
