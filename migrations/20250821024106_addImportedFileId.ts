import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Students
  const studentHasColumn = await knex.schema.hasColumn("students", "importedFilesId");
  if (!studentHasColumn) {
    await knex.schema.alterTable("students", table => {
      table.integer("importedFilesId").unsigned()
        .references("id").inTable("imported-files")
        .onDelete("CASCADE");
    });
  } else {
    console.log('Coluna "importedFilesId" em students já existe, ignorando.');
  }

  // Conversions
  const conversionHasColumn = await knex.schema.hasColumn("conversions", "importedFilesId");
  if (!conversionHasColumn) {
    await knex.schema.alterTable("conversions", table => {
      table.integer("importedFilesId").unsigned()
        .references("id").inTable("imported-files")
        .onDelete("CASCADE");
    });
  } else {
    console.log('Coluna "importedFilesId" em conversions já existe, ignorando.');
  }

  console.log('Migration "addImportedFileId" concluída com sucesso!');
}

export async function down(knex: Knex): Promise<void> {
  // Students
  const studentHasColumn = await knex.schema.hasColumn("students", "importedFilesId");
  if (studentHasColumn) {
    await knex.schema.alterTable("students", table => {
      table.dropColumn("importedFilesId");
    });
  } else {
    console.log('Coluna "importedFilesId" em students não existe, ignorando.');
  }

  // Conversions
  const conversionHasColumn = await knex.schema.hasColumn("conversions", "importedFilesId");
  if (conversionHasColumn) {
    await knex.schema.alterTable("conversions", table => {
      table.dropColumn("importedFilesId");
    });
  } else {
    console.log('Coluna "importedFilesId" em conversions não existe, ignorando.');
  }

  console.log('Rollback da migration "addImportedFileId" concluído com sucesso!');
}
