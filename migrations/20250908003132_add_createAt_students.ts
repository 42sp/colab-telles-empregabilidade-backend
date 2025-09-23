import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('students', 'createdAt');
  if (hasColumn) {
    console.log('Coluna "createdAt" já existe em "students", ignorando.');
    return;
  }

  await knex.schema.alterTable('students', (table) => {
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('students', 'createdAt');
  if (!hasColumn) return;

  await knex.schema.alterTable('students', (table) => {
    table.dropColumn('createdAt');
  });
}
