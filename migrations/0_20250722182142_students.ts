// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	const exists = await knex.schema.hasTable('users');
	if (!exists) {
		await knex.schema.createTable('students', table => {
			table.increments('id')

			table.string('text')
		})
	}
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('students')
}
