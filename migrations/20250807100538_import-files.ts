// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('import-files')) return;
  await knex.schema.createTable('import-files', table => {
    table.increments('id')

    table.string('text')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('import-files')
}
