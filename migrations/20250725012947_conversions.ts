// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('conversions', table => {
    table.increments('id');
    table.string('conversionMonth');
    table.string('studentId');
    table.string('fullName');
    table.string('university');
    table.string('course');
    table.string('targetAudience');
    table.string('targetStatus');
    table.integer('graduationYear');
    table.string('registrationSource');
    table.timestamp('registrationDate');
    table.string('opportunityType');
    table.string('position');
    table.text('details');
    table.string('sectorArea');
    table.string('career');
    table.string('track');
    table.string('organizationName');
    table.string('organizationWebsite');
    table.boolean('partnerCompany');
    table.boolean('topGlobalCompanies');
    table.timestamp('opportunityStart');
    table.timestamp('opportunityEnd');
    table.float('compensation');
    table.string('compensationSource');
    table.boolean('ismartReferral');
    table.string('opportunityStatus');
    table.text('comments');
    table.string('tag');
    table.boolean('featured');
    table.integer('statusPriority');
    table.integer('opportunityTypePriority');
    table.integer('generalPriority');
    table.text('automaticVerificationFormula');
    table.boolean('automaticVerification');
    table.boolean('timeValidation');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('conversions');
}
