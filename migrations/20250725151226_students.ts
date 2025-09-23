import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('students');

  if (!exists) {
    // Cria a tabela caso não exista
    await knex.schema.createTable('students', table => {
      table.increments('id');
      table.string('text');
    });
  }

  // Define todas as colunas que você quer adicionar
  const allColumns: { name: string, type: (table: Knex.AlterTableBuilder) => void }[] = [
    // --- Dados Pessoais ---
    { name: 'name', type: t => t.string('name').notNullable() },
    { name: 'socialName', type: t => t.string('socialName') },
    { name: 'preferredName', type: t => t.string('preferredName') },
    { name: 'ismartEmail', type: t => t.string('ismartEmail').notNullable() },
    { name: 'phoneNumber', type: t => t.string('phoneNumber').notNullable() },
    { name: 'gender', type: t => t.string('gender').notNullable() },
    { name: 'sexualOrientation', type: t => t.string('sexualOrientation') },
    { name: 'raceEthnicity', type: t => t.string('raceEthnicity') },
    { name: 'hasDisability', type: t => t.boolean('hasDisability') },
    { name: 'linkedin', type: t => t.string('linkedin') },

    // --- Acadêmico ---
    { name: 'transferredCourseOrUniversity', type: t => t.boolean('transferredCourseOrUniversity') },
    { name: 'transferDate', type: t => t.date('transferDate') },
    { name: 'currentCourseStart', type: t => t.date('currentCourseStart').notNullable() },
    { name: 'currentCourseStartYear', type: t => t.integer('currentCourseStartYear').notNullable() },
    { name: 'currentCourseEnd', type: t => t.date('currentCourseEnd').notNullable() },
    { name: 'currentCourseEndYear', type: t => t.integer('currentCourseEndYear').notNullable() },
    { name: 'supportedCourseFormula', type: t => t.string('supportedCourseFormula').notNullable() },
    { name: 'currentArea', type: t => t.string('currentArea').notNullable() },
    { name: 'universityType', type: t => t.string('universityType').notNullable() },
    { name: 'currentAggregatedCourse', type: t => t.string('currentAggregatedCourse').notNullable() },
    { name: 'currentDetailedCourse', type: t => t.string('currentDetailedCourse').notNullable() },
    { name: 'currentDetailedUniversity', type: t => t.string('currentDetailedUniversity').notNullable() },

    // --- Localização ---
    { name: 'currentCity', type: t => t.string('currentCity').notNullable() },
    { name: 'currentState', type: t => t.string('currentState').notNullable() },
    { name: 'currentCountry', type: t => t.string('currentCountry').notNullable() },
    { name: 'currentAggregatedLocation', type: t => t.string('currentAggregatedLocation').notNullable() },
    { name: 'groupedLocation', type: t => t.string('groupedLocation').notNullable() },
    { name: 'specificLocation', type: t => t.string('specificLocation').notNullable() },

    // --- Turno e Status ---
    { name: 'currentShift', type: t => t.string('currentShift').notNullable() },
    { name: 'holderContractStatus', type: t => t.string('holderContractStatus').notNullable() },
    { name: 'realStatus', type: t => t.string('realStatus').notNullable() },
    { name: 'realProfile', type: t => t.string('realProfile').notNullable() },
    { name: 'hrProfile', type: t => t.string('hrProfile').notNullable() },
    { name: 'targetStatus', type: t => t.string('targetStatus').notNullable() },
    { name: 'duplicatedTargetStatus', type: t => t.string('duplicatedTargetStatus').notNullable() },
    { name: 'duplicatedCurrentStatus', type: t => t.string('duplicatedCurrentStatus').notNullable() },
    { name: 'targetAudience', type: t => t.string('targetAudience').notNullable() },

    // --- Entrada e Escola ---
    { name: 'entryProgram', type: t => t.string('entryProgram').notNullable() },
    { name: 'projectYears', type: t => t.integer('projectYears').notNullable() },
    { name: 'entryYearClass', type: t => t.string('entryYearClass').notNullable() },
    { name: 'schoolNetwork', type: t => t.string('schoolNetwork').notNullable() },
    { name: 'school', type: t => t.string('school').notNullable() },
    { name: 'standardizedSchool', type: t => t.string('standardizedSchool').notNullable() },

    // --- Profissional ---
    { name: 'working', type: t => t.boolean('working').notNullable() },
    { name: 'opportunityType', type: t => t.string('opportunityType') },
    { name: 'details', type: t => t.string('details') },
    { name: 'sector', type: t => t.string('sector') },
    { name: 'careerTrack', type: t => t.string('careerTrack') },
    { name: 'organization', type: t => t.string('organization') },
    { name: 'website', type: t => t.string('website') },
    { name: 'startDate', type: t => t.date('startDate') },
    { name: 'endDate', type: t => t.date('endDate') },
    { name: 'compensation', type: t => t.decimal('compensation') },
    { name: 'partnerCompanies', type: t => t.boolean('partnerCompanies') },
    { name: 'topGlobalCompanies', type: t => t.boolean('topGlobalCompanies') },

    // --- Conhecimentos e Idiomas ---
    { name: 'languages', type: t => t.specificType('languages', 'text[]') },
    { name: 'technicalKnowledge', type: t => t.specificType('technicalKnowledge', 'text[]') },
    { name: 'officePackageKnowledge', type: t => t.boolean('officePackageKnowledge') },
    { name: 'wordProficiencyLevel', type: t => t.string('wordProficiencyLevel') },
    { name: 'excelProficiencyLevel', type: t => t.string('excelProficiencyLevel') },
    { name: 'powerPointProficiencyLevel', type: t => t.string('powerPointProficiencyLevel') },

    // --- Comentários ---
    { name: 'comments', type: t => t.string('comments') },
    { name: 'tag', type: t => t.string('tag') }
  ];

  // Adiciona as colunas apenas se não existirem
  for (const col of allColumns) {
    const existsCol = await knex.schema.hasColumn('students', col.name);
    if (!existsCol) {
      await knex.schema.alterTable('students', table => {
        col.type(table);
      });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove todas as colunas adicionadas (opcional)
  const allColumnNames = [
    'name','socialName','preferredName','ismartEmail','phoneNumber','gender','sexualOrientation','raceEthnicity','hasDisability','linkedin',
    'transferredCourseOrUniversity','transferDate','currentCourseStart','currentCourseStartYear','currentCourseEnd','currentCourseEndYear','supportedCourseFormula','currentArea','universityType','currentAggregatedCourse','currentDetailedCourse','currentDetailedUniversity',
    'currentCity','currentState','currentCountry','currentAggregatedLocation','groupedLocation','specificLocation',
    'currentShift','holderContractStatus','realStatus','realProfile','hrProfile','targetStatus','duplicatedTargetStatus','duplicatedCurrentStatus','targetAudience',
    'entryProgram','projectYears','entryYearClass','schoolNetwork','school','standardizedSchool',
    'working','opportunityType','details','sector','careerTrack','organization','website','startDate','endDate','compensation','partnerCompanies','topGlobalCompanies',
    'languages','technicalKnowledge','officePackageKnowledge','wordProficiencyLevel','excelProficiencyLevel','powerPointProficiencyLevel',
    'comments','tag'
  ];

  for (const colName of allColumnNames) {
    const existsCol = await knex.schema.hasColumn('students', colName);
    if (existsCol) {
      await knex.schema.alterTable('students', table => {
        table.dropColumn(colName);
      });
    }
  }
}
