import { students } from './students/students'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'
import { columns } from './columns/columns'
// import { columns } from './columns/columns'

export const services = (app: Application) => {
  app.configure(students)
  app.configure(user)
  app.configure(columns)
  // app.configure(columns)
  // All services will be registered here
}
