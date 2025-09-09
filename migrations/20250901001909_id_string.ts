import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('glassdoor')) {
    // Remove a PK
    await knex.schema.alterTable('glassdoor', (table) => {
      table.dropPrimary();
    });
    // Altera o tipo
    await knex.schema.alterTable('glassdoor', (table) => {
      table.string('id').alter();
    });
    // Recria a PK
    await knex.schema.alterTable('glassdoor', (table) => {
      table.primary(['id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('glassdoor')) {
    await knex.schema.alterTable('glassdoor', (table) => {
      table.dropPrimary();
    });
    await knex.schema.alterTable('glassdoor', (table) => {
      table.integer('id').alter();
    });
    await knex.schema.alterTable('glassdoor', (table) => {
      table.primary(['id']);
    });
  }
}