import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	if (!await knex.schema.hasTable('snapshots')) return;
	await knex.schema.alterTable('snapshots', (table) => {
		table.bigint('studentId').references('id').inTable('students').onDelete('CASCADE');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('snapshots');
}

