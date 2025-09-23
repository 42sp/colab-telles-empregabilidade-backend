import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('users')
  if (!exists) {
    // habilita extensão pgcrypto para gerar UUID
    await knex.raw(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)

    await knex.schema.createTable('users', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.string('email').unique()
      table.string('password')
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users')
}
