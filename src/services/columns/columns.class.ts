import { Knex } from 'knex'
import { Params } from '@feathersjs/feathers'
import { getStudentsColumns } from './getStudentsColumns'
import { Application } from '../../declarations'
import { ColumnsMap, ColumnsParams } from './columns.shared';

export class ColumnsService
{
	app: Application;

	constructor(app: Application) {
		this.app = app;
	}

	async find(params?: Params): Promise<ColumnsMap> {
		const knex: Knex = this.app.get('postgresqlClient');
		return (getStudentsColumns(knex));
	}
}
