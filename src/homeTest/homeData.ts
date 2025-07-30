import type { Application } from '../declarations' 

export async function getColumnsData(app: Application) {
	const knex = app.get('postgresqlClient');
	const columnsInfo = await knex('students').columnInfo();

	const result = Object.keys(columnsInfo).reduce((acc, key) => {
		acc[key] = {isVisible: true}
		return (acc);
	}, {} as Record<string, {isVisible: boolean}>);

	return (result);
}
