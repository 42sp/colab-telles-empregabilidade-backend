import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	if (await knex.schema.hasTable('glassdoor')) {
		if (!await knex.schema.hasColumn('glassdoor', 'salaries_url')) {
			await knex.schema.alterTable('glassdoor', table => {
				table.string('salaries_url');
			});
		}
	}
}


export async function down(knex: Knex): Promise<void> {
	if (await knex.schema.hasTable('glassdoor')) {
		if (await knex.schema.hasColumn('glassdoor', 'salaries_url')) {
			await knex.schema.alterTable('glassdoor', table => {
				table.dropColumn('salaries_url');
			});
		}
	}
}

