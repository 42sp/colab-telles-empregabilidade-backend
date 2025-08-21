import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('students', table => {
		table.integer('importedFilesId').unsigned().references('id').inTable('imported-files').onDelete('CASCADE');
	});
	await knex.schema.alterTable('conversions', table => {
		table.integer('importedFilesId').unsigned().references('id').inTable('imported-files').onDelete('CASCADE');
	});
}


export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('students', table => {
		table.dropColumn('importedFilesId');
	});
	await knex.schema.alterTable('conversions', table => {
		table.dropColumn('importedFilesId');
	});
}

