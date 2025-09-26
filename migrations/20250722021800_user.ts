// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	const exists = await knex.schema.hasTable('users');
	if (!exists) {
		await knex.schema.createTable('users', table => {
			table.increments('id')
			table.string('name').notNullable();
			table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
			table.string('email').unique()
			table.string('password')
		})
	}
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
