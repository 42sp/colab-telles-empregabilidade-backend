import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('import-files');
  if (!exists) {
    await knex.schema.createTable('import-files', (table) => {
      table.increments('id');
      table.string('text');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('import-files');
}
