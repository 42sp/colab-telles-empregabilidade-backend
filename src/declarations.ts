// For more information about this file see https://dove.feathersjs.com/guides/cli/typescript.html
import { HookContext as FeathersHookContext, NextFunction } from '@feathersjs/feathers'
import { Application as FeathersApplication } from '@feathersjs/express'
import { ApplicationConfiguration } from './configuration'
import { scrapOperationsPath } from './services/scrap_operations/scrapOperations.shared'
import type { ScrapOperations } from './services/scrap_operations/scrapOperations.schema' // <- pega o tipo dos dados
import type { ScrapOperationsService } from './services/scrap_operations/scrapOperations.class' // <- pega a classe

import { User } from './services/users/users'

export type { NextFunction }

// The types for app.get(name) and app.set(name)
export interface Configuration extends ApplicationConfiguration {}

// A mapping of service names to types. Definido com o tipo da service class (não dos dados em si)
export interface ServiceTypes {
  [scrapOperationsPath]: ScrapOperationsService
}

// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes, Configuration>

// The context for hook functions - can be typed with a service class
export type HookContext<S = any> = FeathersHookContext<Application, S>

// Add the user as an optional property to all params
declare module '@feathersjs/feathers' {
  interface Params {
    user?: User
  }
}
