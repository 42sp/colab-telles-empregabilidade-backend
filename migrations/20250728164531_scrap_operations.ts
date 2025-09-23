import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('scrap_operations');
  if (!exists) {
    await knex.schema.createTable('scrap_operations', table => {
      table.increments('id'); // PK
      table.string('type').notNullable();
      table.string('status').notNullable();
      table.uuid('user_id')
           .references('id')
           .inTable('users')
           .onDelete('CASCADE');

      table.timestamp('started_at').defaultTo(knex.fn.now());
      table.timestamp('finished_at');
      table.json('result');
      table.text('error_message');
    });
  } else {
    console.log('Tabela "scrap_operations" já existe, ignorando criação.');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('scrap_operations');
}
