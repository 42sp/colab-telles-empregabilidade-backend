import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterOptions } from '@feathersjs/knex'
import type { Application } from '../../declarations'

export interface SalaryData {
  Company: string
  JobTitle: string
  Salary: number
  LastUpdate: string
}

export interface SalaryParams extends Params {}

export class SalariesService<
  ServiceParams extends Params = SalaryParams
> extends KnexService<SalaryData, SalaryData, ServiceParams> {
	app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async create(data: SalaryData | SalaryData[], params?: ServiceParams) {
    // se for array, insere em batch
    if (Array.isArray(data)) {
      const inserted = await this.Model('salaries').insert(data).returning('*')
      return inserted
    }

    // se for único objeto
    const inserted = await this.Model('salaries').insert(data).returning('*')
    return inserted[0]
  }
}
