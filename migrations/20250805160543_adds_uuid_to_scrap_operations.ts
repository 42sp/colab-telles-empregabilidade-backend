import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

  const exists = await knex.schema.hasColumn('scrap_operations', 'uuid');
  if (!exists) {
    await knex.schema.alterTable('scrap_operations', (t) => {
      t.uuid('uuid').notNullable().unique().defaultTo(knex.raw('gen_random_uuid()'));
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasColumn('scrap_operations', 'uuid');
  if (exists) {
    await knex.schema.alterTable('scrap_operations', (t) => {
      t.dropColumn('uuid');
    });
  }
}
