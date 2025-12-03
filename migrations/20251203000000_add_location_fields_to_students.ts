import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('students', (table) => {
        table.boolean('telles_foundation').nullable();
        table.boolean('ismart').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('students', (table) => {
        table.dropColumn('telles_foundation');
        table.dropColumn('ismart');
    });
}
