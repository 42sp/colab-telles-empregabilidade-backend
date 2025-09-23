import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('linkedin');
  if (exists) {
    console.log('Tabela "linkedin" já existe, ignorando criação.');
    return;
  }

  await knex.schema.createTable('linkedin', table => {
    table.increments('id')
    table.bigInteger('studentId')
      .notNullable()
      .references('id')
      .inTable('students')
      .onDelete('CASCADE')
    table.string('company_name')
    table.string('current_position')
    table.timestamp('timestamp')
    table.json('data')
    table.string('start_date')
    table.boolean('is_working')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('linkedin')
}
