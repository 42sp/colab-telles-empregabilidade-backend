import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasName = await knex.schema.hasColumn('scrap_operations', 'name');
  const hasUserTag = await knex.schema.hasColumn('scrap_operations', 'user_tag');
  const hasScheduledDate = await knex.schema.hasColumn('scrap_operations', 'scheduled_date');
  const hasScheduledTime = await knex.schema.hasColumn('scrap_operations', 'scheduled_time');

  if (!hasName || !hasUserTag || !hasScheduledDate || !hasScheduledTime) {
    await knex.schema.alterTable('scrap_operations', (table) => {
      if (!hasName) table.string('name').notNullable().defaultTo('');
      if (!hasUserTag) table.string('user_tag').notNullable().defaultTo('');
      if (!hasScheduledDate) table.string('scheduled_date').notNullable().defaultTo('');
      if (!hasScheduledTime) table.string('scheduled_time').notNullable().defaultTo('');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasName = await knex.schema.hasColumn('scrap_operations', 'name');
  const hasUserTag = await knex.schema.hasColumn('scrap_operations', 'user_tag');
  const hasScheduledDate = await knex.schema.hasColumn('scrap_operations', 'scheduled_date');
  const hasScheduledTime = await knex.schema.hasColumn('scrap_operations', 'scheduled_time');

  if (hasName || hasUserTag || hasScheduledDate || hasScheduledTime) {
    await knex.schema.alterTable('scrap_operations', (table) => {
      if (hasName) table.dropColumn('name');
      if (hasUserTag) table.dropColumn('user_tag');
      if (hasScheduledDate) table.dropColumn('scheduled_date');
      if (hasScheduledTime) table.dropColumn('scheduled_time');
    });
  }
}
