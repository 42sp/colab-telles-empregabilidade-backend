// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	if (await knex.schema.hasTable('imported-files')) return;
  await knex.schema.createTable('imported-files', table => {
		table.increments('id')

		table.string('fileName').notNullable()
		table.timestamp('importationDate', { useTz: true }).notNullable()
		table.uuid('userId').notNullable();
		table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('imported-files');
}
