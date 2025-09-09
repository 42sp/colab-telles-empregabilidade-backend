// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('linkedin', table => {
    table.increments('id')
		table.bigInteger('studentId')
			.notNullable()
			.references('id')
			.inTable('students')
			.onDelete('CASCADE')
		table.string('company_name')
		table.string('current_position')
		table.timestamp('timestamp')
		table.json('data')
		table.string('start_date')
		table.boolean('is_working')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('linkedin')
}
