import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('glassdoor', 'region');
  if (hasColumn) {
    await knex.schema.alterTable('glassdoor', table => {
      table.dropColumn('region');
    });
  }

  await knex.schema.alterTable('glassdoor', table => {
    table.string('region');
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('glassdoor', 'region');
  if (hasColumn) {
    await knex.schema.alterTable('glassdoor', table => {
      table.dropColumn('region');
    });
  }
}
