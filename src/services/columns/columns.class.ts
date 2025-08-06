import { Knex } from 'knex'
import { KnexAdapterOptions, KnexService } from '@feathersjs/knex'
import { Paginated, Params } from '@feathersjs/feathers'
import { getStudentsColumns } from './getStudentsColumns'
import { Application } from '../../declarations'
import { ColumnsMap, visibleSet } from './columns.shared';
import { getVisibleStudentsData } from './getStudentsData'

export const getColumnsOptions = (app: Application): KnexAdapterOptions => {
	return {
		paginate: false,
		Model: app.get('postgresqlClient'),
		name: 'students',
	}
}

export class ColumnsService<ServiceParams extends Params = Params> extends KnexService<
	ColumnsMap,
	any,
	ServiceParams,
	any
>
{
	app: Application;

	constructor(app: Application, options: KnexAdapterOptions) {
		super(options)
		this.app = app;
	}

	async getStudents(): Promise<any[]> {
		const knex: Knex = this.app.get('postgresqlClient');
		const result = await getVisibleStudentsData(knex);

		return [result];
	}
	
	async getColumns(): Promise<ColumnsMap[]> {
		const knex: Knex = this.app.get('postgresqlClient');
		const columns = await getStudentsColumns(knex);

		return [columns];
	}

	// async getVisibleStudentsData(): Promise<any[]> {
	// 	const knex: Knex = this.app.get('postgresqlClient');
	// 	const result = await knex('students').columnInfo();
	// 	const visibleColumns =
	// 		Object.keys(result).filter(col => visibleSet.has(col));
	
	// return await knex('students').select(...visibleColumns);

	// }
}
