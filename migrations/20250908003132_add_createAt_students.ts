import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('students', (table) => {
		table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
	});
}


export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('students', (table) => {
		table.dropColumn('createdAt');
	});
}

