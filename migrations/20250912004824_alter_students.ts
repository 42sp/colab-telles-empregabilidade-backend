import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('students', (table) => {
        table.bigInteger('xls_id').nullable();
    });

    await knex('students').update('xls_id', knex.ref('id'));
}


export async function down(knex: Knex): Promise<void> {
}

