import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('snapshots', (table) => {
		table.bigIncrements('id').primary();
		table.string('snapshot');
		table.string('linkedin');
	});
}


export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('snapshots');
}

