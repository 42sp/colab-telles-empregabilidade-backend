// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('glassdoor', table => {
    table.bigInteger('id').primary()
    table.string('company')
    table.string('country_code')
    table.integer('salaries_count')
    table.string('company_type')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('glassdoor')
}
