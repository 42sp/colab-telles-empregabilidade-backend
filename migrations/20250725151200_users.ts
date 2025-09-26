import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('users', table => {
		table.string('name').notNullable();
		table.timestamp('created_at', { useTz: true }).notNullable()
		
	})
}


export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('users', table => {
		table.dropColumn('text')
	})
}

