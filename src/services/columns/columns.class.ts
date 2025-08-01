import { Knex } from 'knex'
import { Application } from '../../declarations'
import { Params } from '@feathersjs/feathers'
import { getStudentsColumns } from './getStudentsColumns'

type ColumnMeta = {
  label: string
  isVisible: boolean
}

export const columnsPath: string = "columns"

export type ColumnsMap = Record<string, ColumnMeta>

class ColunmsService {
	app: Application;

	constructor(app: Application) {
		this.app = app;
	}

	async find(params?: Params): Promise<ColumnsMap> {
		const knex: Knex = this.app.get('postgresqlClient');
		return (getStudentsColumns(knex));
	}
}

export const columns = (app: Application) => {
	app.use(columnsPath, new ColunmsService(app), {
		methods: ['find'],
		events: [],
	});
}
