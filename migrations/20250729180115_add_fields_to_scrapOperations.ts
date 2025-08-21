import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('scrap_operations', (table) => {
    table.string('name').notNullable().defaultTo('');        // Nome da operação agendada
    table.string('user_tag').notNullable().defaultTo('');    // Tag do usuário
    table.string('scheduled_date').notNullable().defaultTo(''); // Data agendada
    table.string('scheduled_time').notNullable().defaultTo(''); // Hora agendada
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('scrap_operations', (table) => {
    table.dropColumn('name')
    table.dropColumn('user_tag')
    table.dropColumn('scheduled_date')
    table.dropColumn('scheduled_time')
  })
}
