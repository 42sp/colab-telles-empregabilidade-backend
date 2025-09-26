import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('scrap_operations', table => {
    table.increments('id')
    table.string('type').notNullable() // Tipo de operação (ex: LinkedIn)
    table.string('status').notNullable() // Status (ex: pending, running, done, error)
    table.integer('user_id').references('id').inTable('users') // Quem agendou
    table.timestamp('started_at').defaultTo(knex.fn.now()) // Quando começou
    table.timestamp('finished_at') // Quando terminou
    table.json('result') // Resultado da operação (dados, erros, etc)
    table.text('error_message') // Mensagem de erro, se houver
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('scrap_operations')
}