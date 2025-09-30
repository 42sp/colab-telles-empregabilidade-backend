import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Habilita extensão pgcrypto (se ainda não tiver)
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
if (await knex.schema.hasTable('scrap_operations')) return;
  await knex.schema.createTable("scrap_operations", (table) => {
    table.increments("id").primary(); // PK

    // UUID gerado automaticamente
    table.uuid("uuid").unique().defaultTo(knex.raw('gen_random_uuid()'));

    table.string("name").notNullable();
    table.string("type");
    table.enu("status", ["Agendado", "Em Execução", "Concluído", "Falha"]).notNullable();
    table.string("user_tag").notNullable();

    table.date("scheduled_date").notNullable();
    table.string("scheduled_time").notNullable();
    table.string("repeat_days");
    table.string("repeat_time");

    table.string("created_by");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.boolean("deleted").defaultTo(false);
    table.string("deleted_by");
    table.timestamp("deleted_at");
    table.string("last_edited_by");
    table.timestamp("last_edited_at");

    table.timestamp("started_at");
    table.timestamp("finished_at");
    table.jsonb("result");
    table.text("error_message");
    table.jsonb("target_conditions");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("scrap_operations");
}
