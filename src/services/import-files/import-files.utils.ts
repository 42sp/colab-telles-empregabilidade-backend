import { importFiles, ImportFilesService } from "./import-files"

export const createStudentsObjectFromArray = (importFilesService: ImportFilesService, rowArray: any[]) => {
	// Mapeia dados quando o Excel vem como array (sem headers)
	const obj = {
		// Personal Data
		xls_id: importFilesService.toInt(rowArray[2]) ?? undefined, // Coluna 2: ID
		name: importFilesService.s(rowArray[3]) || 'Sem nome', // Coluna 3: Nome
		socialName: importFilesService.s(rowArray[4]) ?? undefined,
		preferredName: importFilesService.s(rowArray[5]) ?? undefined, // Coluna 5: Apelido
		ismartEmail: importFilesService.s(rowArray[6]) || '', // Coluna 6: Email
		phoneNumber: importFilesService.s(rowArray[7]) || '', // Coluna 7: Telefone
		gender: importFilesService.s(rowArray[8]) || '', // Coluna 8: Gênero
		sexualOrientation: importFilesService.s(rowArray[9]) ?? undefined, // Coluna 9: Orientação
		raceEthnicity: importFilesService.s(rowArray[10]) ?? undefined, // Coluna 10: Raça
		hasDisability: importFilesService.toBool(rowArray[11]) ?? undefined, // Coluna 11: PCD
		linkedin: importFilesService.normalizeLinkedinUrl(importFilesService.s(rowArray[12])) ?? undefined, // Coluna 12: LinkedIn

		// Academic Data
		transferredCourseOrUniversity: importFilesService.toBool(rowArray[13]) ?? undefined, // Coluna 13: Transferência
		transferDate: undefined,
		currentCourseStart: undefined,
		currentCourseStartYear: importFilesService.toInt(rowArray[0]) ?? undefined, // Coluna 0: Ano início
		currentCourseEnd: undefined,
		currentCourseEndYear: importFilesService.toInt(rowArray[1]) ?? undefined, // Coluna 1: Ano fim
		supportedCourseFormula: '',
		currentArea: importFilesService.s(rowArray[14]) || '', // Coluna 14: Área
		universityType: importFilesService.s(rowArray[15]) || '', // Coluna 15: Tipo Universidade
		currentAggregatedCourse: importFilesService.s(rowArray[16]) || '', // Coluna 16: Curso Agregado
		currentDetailedCourse: importFilesService.s(rowArray[17]) || '', // Coluna 17: Curso Detalhado
		currentDetailedUniversity: importFilesService.s(rowArray[18]) || '', // Coluna 18: Universidade
		currentCity: importFilesService.s(rowArray[19]) || '', // Coluna 19: Cidade
		currentState: importFilesService.s(rowArray[20]) || '', // Coluna 20: Estado
		currentCountry: importFilesService.s(rowArray[21]) || '', // Coluna 21: País
		currentAggregatedLocation: importFilesService.s(rowArray[22]) || '', // Coluna 22: Local Agregado
		currentShift: importFilesService.s(rowArray[23]) || '', // Coluna 23: Turno

		// Status and Profile
		holderContractStatus: '',
		realStatus: importFilesService.s(rowArray[24]) || '', // Coluna 24: Status real
		realProfile: importFilesService.s(rowArray[25]) || '', // Coluna 25: Perfil real
		hrProfile: '',
		targetStatus: importFilesService.s(rowArray[26]) || '', // Coluna 26: Status Meta
		entryProgram: '',
		projectYears: 0,
		entryYearClass: '',
		schoolNetwork: '',
		school: '',
		standardizedSchool: '',
		groupedLocation: '',
		specificLocation: '',
		duplicatedTargetStatus: '',
		duplicatedCurrentStatus: '',
		targetAudience: importFilesService.s(rowArray[27]) || '', // Coluna 27: Público

		// Work and Opportunities
		working: importFilesService.toBool(rowArray[39]) ?? false, // Coluna 39: Trabalhando
		opportunityType: undefined,
		details: undefined,
		sector: undefined,
		careerTrack: undefined,
		organization: undefined,
		website: undefined,
		startDate: undefined,
		endDate: undefined,
		compensation: undefined,
		partnerCompanies: undefined,
		topGlobalCompanies: undefined,
		comments: undefined,
		tag: undefined,

		// Months - todos undefined por enquanto
		jan: undefined,
		feb: undefined,
		mar: undefined,
		apr: undefined,
		may: undefined,
		jun: undefined,
		jul: undefined,
		aug: undefined,
		sep: undefined,
		oct: undefined,
		nov: undefined,
		dec: undefined,

		january: undefined,
		february: undefined,
		march: undefined,
		april: undefined,
		mayFull: undefined,
		june: undefined,
		july: undefined,
		august: undefined,
		september: undefined,
		october: undefined,
		november: undefined,
		december: undefined,

		january2: undefined,
		february2: undefined,
		march2: undefined,
		april2: undefined,
		may2: undefined,
		june2: undefined,
		july2: undefined,
		august2: undefined,
		september2: undefined,
		october2: undefined,
		november2: undefined,
		december2: undefined,

		// Career Questionnaire
		internshipUnavailabilityReason: undefined,
		careerTrajectoryInterests: undefined,
		primaryInterest: undefined,
		secondaryInterest: undefined,
		intendedWorkingAreas: undefined,
		additionalAreaInterests: undefined,
		seekingProfessionalOpportunity: undefined,
		opportunitiesLookingFor: undefined,
		opportunityDetails: undefined,

		// Skills
		languages: undefined,
		technicalKnowledge: undefined,
		officePackageKnowledge: undefined,
		wordProficiencyLevel: undefined,
		excelProficiencyLevel: undefined,
		powerPointProficiencyLevel: undefined,

		createdAt: new Date().toISOString()
	};

	return obj;
}

export const createStudentsObject = (importFilesService: ImportFilesService, row: any) => {
	const obj = {
		// Personal Data
		xls_id: importFilesService.toInt(row["ID"]) ?? undefined,
		name: importFilesService.s(row["NOME"]) || 'Sem nome',
		socialName: importFilesService.s(row["Nome_social"]) ?? undefined,
		preferredName: importFilesService.s(row["Como_gostaria_de_ser_chamado"]) ?? undefined,
		ismartEmail: importFilesService.s(row["Email_Ismart"]) || '',
		phoneNumber: importFilesService.s(row["Celular"]) || '',
		gender: importFilesService.s(row["Gênero"]) || '',
		sexualOrientation: importFilesService.s(row["Orientação Sexual"]) ?? undefined,
		raceEthnicity: importFilesService.s(row["Cor_raça"]) ?? undefined,
		hasDisability: importFilesService.toBool(row["PCD?"]) ?? undefined,
		linkedin: importFilesService.normalizeLinkedinUrl(importFilesService.s(row["LinkedIn"])) ?? undefined,

		// Academic Data
		transferredCourseOrUniversity: importFilesService.toBool(row["Transferencia_Curso_ou_Universidade"]) ?? undefined,
		transferDate: importFilesService.toDateStr(row["Data_Transferência"]) ?? undefined,
		currentCourseStart: importFilesService.toDateStr(row["Inicio_Curso_Atual"]) ?? undefined,
		currentCourseStartYear: importFilesService.toInt(row["Ano_Inicio_Curso_Atual"]) ?? undefined,
		currentCourseEnd: importFilesService.toDateStr(row["Termino_Curso_Atual"]) ?? undefined,
		currentCourseEndYear: importFilesService.toInt(row["Ano_Termino_Curso_Atual"]) ?? undefined,
		supportedCourseFormula: importFilesService.s(row["Curso_Apoiado_Fórmula"]) || '',
		currentArea: importFilesService.s(row["Area_Atual"]) || '',
		universityType: importFilesService.s(row["Tipo_Universidade"]) || '',
		currentAggregatedCourse: importFilesService.s(row["Curso_Agregado_Atual"]) || '',
		currentDetailedCourse: importFilesService.s(row["Curso_Detalhado_Atual"]) || '',
		currentDetailedUniversity: importFilesService.s(row["Universidade_Detalhado_Atual"]) || '',
		currentCity: importFilesService.s(row["Cidade_Atual"]) || '',
		currentState: importFilesService.s(row["Estado_Atual"]) || '',
		currentCountry: importFilesService.s(row["Pais_Atual"]) || '',
		currentAggregatedLocation: importFilesService.s(row["Local_Agregado_Atual"]) || '',
		currentShift: importFilesService.s(row["Turno_atual"]) || '',

		// Status and Profile
		holderContractStatus: importFilesService.s(row["Status_Contrato_Titular"]),
		realStatus: importFilesService.s(row["Status_real"]),
		realProfile: importFilesService.s(row["Perfil_real"]) || '',
		hrProfile: importFilesService.s(row["Perfil_RR"]),
		targetStatus: importFilesService.s(row["Status_Meta"]),
		entryProgram: importFilesService.s(row["Programa_Entrada"]) || '',
		projectYears: importFilesService.toInt(row["Anos_de_Projeto"]) ?? 0,
		entryYearClass: importFilesService.s(row["Turma_Ano_de_Entrada_"]) || '',
		schoolNetwork: importFilesService.s(row["Rede_Escola"]) || '',
		school: importFilesService.s(row["Colegio"]) || '',
		standardizedSchool: importFilesService.s(row["Colegio_Padronizado"]) || '',
		groupedLocation: importFilesService.s(row["Praça_Agrupado"]) || '',
		specificLocation: importFilesService.s(row["Praça_Especifico"]) || '',
		duplicatedTargetStatus: importFilesService.s(row["Status Meta"]),
		duplicatedCurrentStatus: importFilesService.s(row["Status Atual"]),
		targetAudience: importFilesService.s(row["Público Meta"]) || '',

		// Work and Opportunities
		working: importFilesService.toBool(row["Trabalhando"]) ?? false,
		opportunityType: importFilesService.s(row["Tipo_de_oportunidade"]) ?? undefined,
		details: importFilesService.s(row["Detalhe"]) ?? undefined,
		sector: importFilesService.s(row["Setor"]) ?? undefined,
		careerTrack: importFilesService.s(row["Trilha_de_carreira"]) ?? undefined,
		organization: importFilesService.s(row["Organizacao"]) ?? undefined,
		website: importFilesService.s(row["Site"]) ?? undefined,
		startDate: importFilesService.toDateStr(row["Inicio"]) ?? undefined,
		endDate: importFilesService.toDateStr(row["Termino"]) ?? undefined,
		compensation: importFilesService.toNumber(row["Remuneração"]) ?? undefined,
		partnerCompanies: importFilesService.toBool(row["Empresas_parceiras"]) ?? undefined,
		topGlobalCompanies: importFilesService.toBool(row["Top_Global_Empresas"]) ?? undefined,
		telles_foundation: importFilesService.toBool(row["Telles Foundation"]) ?? undefined,
		ismart: importFilesService.toBool(row["Ismart"]) ?? undefined,
		comments: importFilesService.s(row["Comentários"]) ?? undefined,
		tag: importFilesService.s(row["Tag"]) ?? undefined,

		// Months (first series)
		jan: importFilesService.s(row["JAN"]) ?? undefined,
		feb: importFilesService.s(row["FEV"]) ?? undefined,
		mar: importFilesService.s(row["MAR"]) ?? undefined,
		apr: importFilesService.s(row["ABR"]) ?? undefined,
		may: importFilesService.s(row["MAI"]) ?? undefined,
		jun: importFilesService.s(row["JUN"]) ?? undefined,
		jul: importFilesService.s(row["JUL"]) ?? undefined,
		aug: importFilesService.s(row["AGO"]) ?? undefined,
		sep: importFilesService.s(row["SET"]) ?? undefined,
		oct: importFilesService.s(row["OUT"]) ?? undefined,
		nov: importFilesService.s(row["NOV"]) ?? undefined,
		dec: importFilesService.s(row["DEZ"]) ?? undefined,

		// Months (second series - full names)
		january: importFilesService.s(row["Janeiro"]) ?? undefined,
		february: importFilesService.s(row["Fevereiro"]) ?? undefined,
		march: importFilesService.s(row["Março"]) ?? undefined,
		april: importFilesService.s(row["Abril"]) ?? undefined,
		mayFull: importFilesService.s(row["Maio"]) ?? undefined,
		june: importFilesService.s(row["Junho"]) ?? undefined,
		july: importFilesService.s(row["Julho"]) ?? undefined,
		august: importFilesService.s(row["Agosto"]) ?? undefined,
		september: importFilesService.s(row["Setembro"]) ?? undefined,
		october: importFilesService.s(row["Outubro"]) ?? undefined,
		november: importFilesService.s(row["Novembro"]) ?? undefined,
		december: importFilesService.s(row["Dezembro"]) ?? undefined,

		// Months (third series)
		january2: importFilesService.s(row["Janeiro2"]) ?? undefined,
		february2: importFilesService.s(row["Fevereiro2"]) ?? undefined,
		march2: importFilesService.s(row["Março2"]) ?? undefined,
		april2: importFilesService.s(row["Abril2"]) ?? undefined,
		may2: importFilesService.s(row["Maio2"]) ?? undefined,
		june2: importFilesService.s(row["Junho2"]) ?? undefined,
		july2: importFilesService.s(row["Julho2"]) ?? undefined,
		august2: importFilesService.s(row["Agosto2"]) ?? undefined,
		september2: importFilesService.s(row["Setembro2"]) ?? undefined,
		october2: importFilesService.s(row["Outubro2"]) ?? undefined,
		november2: importFilesService.s(row["Novembro2"]) ?? undefined,
		december2: importFilesService.s(row["Dezembro2"]) ?? undefined,

		// Career Questionnaire
		internshipUnavailabilityReason: importFilesService.s(row["Justifique o motivo de não poder estagiar"]) ?? undefined,
		careerTrajectoryInterests: (() => {
			const arr = importFilesService.splitList(row["Por quais das trajetórias de carreira a seguir você se interessa?"]);
			return arr.length ? arr : undefined;
		})(),
		primaryInterest: importFilesService.s(row["Destas trilhas, qual seria o seu interesse prioritário?"]) ?? undefined,
		secondaryInterest: importFilesService.s(row["Destas trilhas, qual seria o seu interesse secundário?"]) ?? undefined,
		intendedWorkingAreas: (() => {
			const arr = importFilesService.splitList(row["Em qual ou quais das áreas a seguir pretende atuar?"]);
			return arr.length ? arr : undefined;
		})(),
		additionalAreaInterests: importFilesService.s(row["Use esse espaço para complementar sua área de interesse."]) ?? undefined,
		seekingProfessionalOpportunity: importFilesService.toBool(row["Você está em busca de alguma oportunidade profissional?"]) ?? undefined,
		opportunitiesLookingFor: (() => {
			const arr = importFilesService.splitList(row["Qual ou quais oportunidades está buscando?"]);
			return arr.length ? arr : undefined;
		})(),
		opportunityDetails: importFilesService.s(row["Conte brevemente sobre as oportunidades que está buscando."]) ?? undefined,

		// Skills
		languages: (() => {
			const arr = importFilesService.splitList(row["Idiomas"]);
			return arr.length ? arr : undefined;
		})(),
		technicalKnowledge: (() => {
			const arr = importFilesService.splitList(row["Conhecimentos Tecnológicos"]);
			return arr.length ? arr : undefined;
		})(),
		officePackageKnowledge: importFilesService.toBool(row["Você tem conhecimento em Pacote Office?"]) ?? undefined,
		wordProficiencyLevel: importFilesService.s(row["Qual seu grau de conhecimento em Word?"]) ?? undefined,
		excelProficiencyLevel: importFilesService.s(row["Qual seu grau de conhecimento em Excel?"]) ?? undefined,
		powerPointProficiencyLevel: importFilesService.s(row["Qual seu grau de conhecimento em PowerPoint?"]) ?? undefined,

		createdAt: new Date().toISOString()
	};

	return obj;
}