// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Linkedin, LinkedinData, LinkedinPatch, LinkedinQuery } from './linkedin.schema'
import { link } from 'fs'

export type { Linkedin, LinkedinData, LinkedinPatch, LinkedinQuery }

export interface LinkedinParams extends KnexAdapterParams<LinkedinQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class LinkedinService<ServiceParams extends Params = LinkedinParams> extends KnexService<
  Linkedin,
  LinkedinData,
  LinkedinParams,
  LinkedinPatch
> {
	async create(data: LinkedinData | LinkedinData[], params?: LinkedinParams): Promise<any> {
		const trx = await this.Model.transaction();

		try
		{
			const dataArray = Array.isArray(data) ? data : [data];

			for (let item of dataArray)
			{
				let result = undefined;
				const current_company = item["current_company"] as { name?: string; title?: string } | undefined;

				const student = await this.Model('students')
					.whereLike('linkedin', `%${item["id"]}%`)
					.first();

				if (student)
				{
					result = {
						studentId: student ? student.id : null,
						company_name: current_company?.name ?? "",
						current_position: current_company?.title ?? "",
						timestamp: item["timestamp"],
						data: JSON.stringify(item),
						start_date: "",
						is_working: current_company?.name ? true : false,
					};
				}

				const resultLinkedIn = await this.Model('linkedin').insert(result);

				if (!resultLinkedIn) {
					throw new Error('Erro ao inserir dados de linkedin.');
				}

			}

			await trx.commit();

			return { status: 'OK', message: `Processado com sucesso!` };
		}
		catch(err: any)
		{
			await trx.rollback();
			throw err;
		}
	}
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'linkedin',
		multi: true
  }
}
