import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasRepeatDays = await knex.schema.hasColumn('scrap_operations', 'repeat_days');
  const hasRepeatTime = await knex.schema.hasColumn('scrap_operations', 'repeat_time');

  if (!hasRepeatDays || !hasRepeatTime) {
    await knex.schema.alterTable('scrap_operations', (t) => {
      if (!hasRepeatDays) t.string('repeat_days').nullable();
      if (!hasRepeatTime) t.string('repeat_time').nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasRepeatDays = await knex.schema.hasColumn('scrap_operations', 'repeat_days');
  const hasRepeatTime = await knex.schema.hasColumn('scrap_operations', 'repeat_time');

  if (hasRepeatDays || hasRepeatTime) {
    await knex.schema.alterTable('scrap_operations', (t) => {
      if (hasRepeatDays) t.dropColumn('repeat_days');
      if (hasRepeatTime) t.dropColumn('repeat_time');
    });
  }
}
