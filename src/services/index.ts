import { importFiles } from './import-files/import-files'
import { conversions } from './conversions/conversions'
import { students } from './students/students'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(importFiles)
  app.configure(conversions)
  app.configure(students)
  app.configure(user)
  // All services will be registered here
}
