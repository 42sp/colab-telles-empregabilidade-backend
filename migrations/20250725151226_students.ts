import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	if (await knex.schema.hasTable('students')) return;
	await knex.schema.alterTable('students', table => {
		table.string('name').notNullable();
		table.string('socialName');
		table.string('preferredName');
		table.string('ismartEmail').notNullable();
		table.string('phoneNumber').notNullable();
		table.string('gender').notNullable();
		table.string('sexualOrientation');
		table.string('raceEthnicity');
		table.boolean('hasDisability');
		table.string('linkedin');

		table.boolean('transferredCourseOrUniversity');
		table.date('transferDate');
		table.date('currentCourseStart').notNullable();
		table.integer('currentCourseStartYear').notNullable();
		table.date('currentCourseEnd').notNullable();
		table.integer('currentCourseEndYear').notNullable();
		table.string('supportedCourseFormula').notNullable();
		table.string('currentArea').notNullable();
		table.string('universityType').notNullable();
		table.string('currentAggregatedCourse').notNullable();
		table.string('currentDetailedCourse').notNullable();
		table.string('currentDetailedUniversity').notNullable();
		table.string('currentCity').notNullable();
		table.string('currentState').notNullable();
		table.string('currentCountry').notNullable();
		table.string('currentAggregatedLocation').notNullable();
		table.string('currentShift').notNullable();

		table.string('holderContractStatus').notNullable();
		table.string('realStatus').notNullable();
		table.string('realProfile').notNullable();
		table.string('hrProfile').notNullable();
		table.string('targetStatus').notNullable();
		table.string('entryProgram').notNullable();
		table.integer('projectYears').notNullable();
		table.string('entryYearClass').notNullable();
		table.string('schoolNetwork').notNullable();
		table.string('school').notNullable();
		table.string('standardizedSchool').notNullable();
		table.string('groupedLocation').notNullable();
		table.string('specificLocation').notNullable();
		table.string('duplicatedTargetStatus').notNullable();
		table.string('duplicatedCurrentStatus').notNullable();
		table.string('targetAudience').notNullable();

		table.boolean('working').notNullable();
		table.string('opportunityType');
		table.string('details');
		table.string('sector');
		table.string('careerTrack');
		table.string('organization');
		table.string('website');
		table.date('startDate');
		table.date('endDate');
		table.decimal('compensation');
		table.boolean('partnerCompanies');
		table.boolean('topGlobalCompanies');
		table.string('comments');
		table.string('tag');

		table.string('jan');
		table.string('feb');
		table.string('mar');
		table.string('apr');
		table.string('may');
		table.string('jun');
		table.string('jul');
		table.string('aug');
		table.string('sep');
		table.string('oct');
		table.string('nov');
		table.string('dec');

		table.string('january');
		table.string('february');
		table.string('march');
		table.string('april');
		table.string('mayFull');
		table.string('june');
		table.string('july');
		table.string('august');
		table.string('september');
		table.string('october');
		table.string('november');
		table.string('december');

		table.string('january2');
		table.string('february2');
		table.string('march2');
		table.string('april2');
		table.string('may2');
		table.string('june2');
		table.string('july2');
		table.string('august2');
		table.string('september2');
		table.string('october2');
		table.string('november2');
		table.string('december2');

		table.string('internshipUnavailabilityReason');
		table.specificType('careerTrajectoryInterests', 'text[]');
		table.string('primaryInterest');
		table.string('secondaryInterest');
		table.specificType('intendedWorkingAreas', 'text[]');
		table.string('additionalAreaInterests');
		table.boolean('seekingProfessionalOpportunity');
		table.specificType('opportunitiesLookingFor', 'text[]');
		table.string('opportunityDetails');

		table.specificType('languages', 'text[]');
		table.specificType('technicalKnowledge', 'text[]');
		table.boolean('officePackageKnowledge');
		table.string('wordProficiencyLevel');
		table.string('excelProficiencyLevel');
		table.string('powerPointProficiencyLevel');
	})
}


export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('students', table => {
		table.dropColumn('text')
	})
}

