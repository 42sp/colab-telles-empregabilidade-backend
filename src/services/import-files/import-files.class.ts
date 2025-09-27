// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { ImportFiles, ImportFilesData, ImportFilesPatch, ImportFilesQuery } from './import-files.schema'

import * as XLSX from 'xlsx';
import { ImportedFiles } from '../imported-files/imported-files'
import { useServices } from '../../hooks/useServices'
import { BadRequest } from '@feathersjs/errors'
import { Knex } from 'knex'
import { link } from 'fs'

export type { ImportFiles, ImportFilesData, ImportFilesPatch, ImportFilesQuery }

export interface ImportFilesParams extends KnexAdapterParams<ImportFilesQuery> {
  file?: {
	buffer: Buffer;
	originalname: string;
	[key: string]: any;
  };
}

interface FileParams {
	[key: string]: any;
	buffer: Buffer;
	originalname: string;
}

export class ImportFilesService<ServiceParams extends Params = ImportFilesParams> extends KnexService<
  ImportFiles,
  ImportFilesData,
  ImportFilesParams,
  ImportFilesPatch
> {
  async create(data: ImportFilesData, params?: ImportFilesParams): Promise<ImportFiles>;
  async create(data: ImportFilesData[], params?: ImportFilesParams): Promise<ImportFiles[]>;
  async create(data: ImportFilesData | ImportFilesData[], params?: ImportFilesParams): Promise<any> {
		const file = params?.file || (params as any)?.files?.file || (params as any)?.files?.[0];
		if (!file) throw new Error('Nenhum arquivo enviado');

		let result = {
			status: 'OK',
			message: ''
		};

		const trx = await this.Model.transaction();

		try
		{
			const accessToken = params?.authentication?.accessToken
			const id = await this.insertImportedFile(file, String(params?.user?.id ?? ''), trx);
			let studentsData = await this.insertBdGeral(file, id, trx, accessToken);
			studentsData = await this.insertNameLinkedin(file, id, trx, accessToken);
			await this.insertConversionsData(file, id, trx);
			result = await this.postLinkedIn(studentsData.dbGeralData, trx, params?.authentication?.accessToken);

			// throw new Error("rollback");
			if (result.status === 'OK') {
				await trx.commit();
				result.message = `${file.originalname} processado com sucesso!`;
			}
			else {
				await trx.rollback();
				result.message = `${file.originalname} processado com erros: ${result.message}`;
			}
		}
		catch(err: any)
		{
			await trx.rollback();
			throw err;
		}
		return result;
	}

	async insertImportedFile(file: FileParams, userId: string, trx: Knex.Transaction) {
		const obj = {
			fileName: file.originalname,
			importationDate: new Date().toISOString(),
			userId: userId
		 } as ImportedFiles;

		const result = await trx('imported-files').insert(obj).returning(['id']);

		if (!result) {
			throw new Error('Erro ao inserir arquivo importado.');
		}

		return result[0].id ?? null;
	}

	async insertConversionsData(file: FileParams, importedFilesId: number, trx: Knex.Transaction) {
		const result = {
			status: 'OK',
			message: ''
		};

		try
		{

			const workbook = XLSX.read(file.buffer, { type: 'buffer' });
			const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'conversão');
			if (!sheetName) throw new BadRequest('Aba "conversão" não encontrada');

			const sheet = workbook.Sheets[sheetName];
			const rows = XLSX.utils.sheet_to_json(sheet);

			const filteredRows = rows.filter((row: any) => {
				if (!row || typeof row !== 'object') return false;
				return Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '');
			});

			const conversionsData = filteredRows.map((row: any) => {
				return {
					conversionMonth: this.s(row['Mês Conversao']),
					organizationName: this.s(row['Nome da Organização']),
					studentId: this.s(row['RA']),
					fullName: this.s(row['Nome_Completo']),
					university: this.s(row['Universidade']),
					course: this.s(row['Curso']),
					targetAudience: this.s(row['Público meta']),
					targetStatus: this.s(row['Status Meta']),
					graduationYear: this.toInt(row['Ano de Término']),
					registrationSource: this.s(row['Fonte Registro']),
					registrationDate: this.toDateStr(row['Data Registro']),
					opportunityType: this.s(row['Tipo Oportunidade']),
					position: this.s(row['Cargo']),
					details: this.s(row['Detalhe']),
					sectorArea: this.s(row['Setor/ Área Oportunidade']),
					career: this.s(row['Carreira']),
					track: this.s(row['Trilha']),
					organizationWebsite: this.s(row['Site_Organização']),
					partnerCompany: row['Empresa Parceira'] === 'Sim',
					topGlobalCompanies: row['Top_Global_Empresas'] === 'Sim',
					opportunityStart: this.toDateStr(row['Início Oportunidade']),
					opportunityEnd: this.toDateStr(row['Término Oportunidade']),
					compensation: this.toNumber(row['Remuneração']),
					compensationSource: this.s(row['Fonte Remuneração']),
					ismartReferral: row['Indicação_Ismart'] === 'Sim',
					opportunityStatus: this.s(row['Status_Oportunidade']),
					comments: this.s(row['Comentário']),
					tag: this.s(row['Tag']),
					featured: row['Destaque?'] === 'Sim',
					statusPriority: this.toInt(row['Prioridade Status']),
					opportunityTypePriority: this.toInt(row['Prioridade Tipo de Oportunidade']),
					generalPriority: this.toInt(row['Prioridade Geral']),
					automaticVerificationFormula: this.s(row['Fórmula - verificação automática']),
					automaticVerification: row['Verificação Automática'] === 'Sim',
					timeValidation: row['Validação - Tempo'] === 'Sim',
					importedFilesId: importedFilesId
				};
			}).filter(item => (
				item &&
				item.conversionMonth && String(item.conversionMonth).trim() !== '' &&
				item.studentId && String(item.studentId).trim() !== '' &&
				item.fullName && String(item.fullName).trim() !== ''
			));

			console.log(conversionsData);

			if (!conversionsData.length) {
				throw new BadRequest('Nenhuma linha válida encontrada para importação. Verifique o arquivo.');
			}

			const result = await trx('conversions').insert(conversionsData);

			if (!result) {
				throw new BadRequest('Erro ao inserir dados de conversão.');
			}
		}
		catch(err: any) {
			console.log(err);
			result.status = 'ERROR';
			result.message = err.message || 'Erro ao processar dados de conversão.';
		}

		return result;
	}

	async postLinkedIn(dbGeralData: any[], trx: Knex.Transaction, accessToken?: string) {
		const $service = useServices();

		const result = {
			status: 'OK',
			message: ''
		};

		try
		{
			const chunkSize = 10;
			for (let i = 0; i < dbGeralData.length; i += chunkSize) {
				const chunk = dbGeralData.slice(i, i + chunkSize);
				const response = await $service.searchLinkedIn(
					{ urls: chunk.map(m => ({ url: m.linkedin })) },
					String(accessToken)
				);

				if (response?.data?.snapshot_id)
				{
					await trx("snapshots").insert(chunk.map(m => (
						{
							linkedin: m.linkedin,
							snapshot: response.data.snapshot_id
						}
					)));
				}
			}
		}
		catch(err: any) {
			console.error('Erro ao buscar LinkedIn:', err);
			result.status = 'ERROR';
			result.message = err.message || 'Erro ao buscar dados do LinkedIn.';
		}
		return result;
	}

	async insertBdGeral(file: FileParams, importedFilesId: number, trx: Knex.Transaction, accessToken?: string) {
		const result = {
			status: 'OK',
			message: '',
			studentsId: [] as number[],
			dbGeralData: [] as any[]
		};

		try
		{
			const workbook = XLSX.read(file.buffer, { type: 'buffer' });
			const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'bd_geral');
			if (!sheetName) throw new BadRequest('Aba "bd_geral" não possui dados para importar.');

			const sheet = workbook.Sheets[sheetName];
			const rows = XLSX.utils.sheet_to_json(sheet, { range: 1 });

			const headers = Object.keys(Object(rows[0]));

			const filteredRows = rows.filter((row: any) => {
				if (!row || typeof row !== 'object') return false;
				return Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '');
			});

			let dbGeralData = filteredRows.map((row: any, index: number) => {
				return {
					// Personal Data
					xls_id: this.s(row[headers[0]]),
					name: this.s(row[headers[1]]),
					socialName: this.s(row[headers[2]]) ?? undefined,
					preferredName: this.s(row[headers[3]]) ?? undefined,
					ismartEmail: this.s(row[headers[4]]),
					phoneNumber: this.s(row[headers[5]]),
					gender: this.s(row[headers[6]]),
					sexualOrientation: this.s(row[headers[7]]) ?? undefined,
					raceEthnicity: this.s(row[headers[8]]) ?? undefined,
					hasDisability: this.toBool(row[headers[9]]) ?? undefined,
					linkedin: this.s(row[headers[10]]) ?? undefined,

					// Academic Data
					transferredCourseOrUniversity: this.toBool(row[headers[11]]) ?? undefined,
					transferDate: this.toDateStr(row[headers[12]]) ?? undefined,
					currentCourseStart: this.toDateStr(row[headers[13]]) ?? undefined,
					currentCourseStartYear: this.toInt(row[headers[14]]) ?? undefined,
					currentCourseEnd: this.toDateStr(row[headers[15]]) ?? undefined,
					currentCourseEndYear: this.toInt(row[headers[16]]) ?? undefined,
					supportedCourseFormula: this.s(row[headers[17]]),
					currentArea: this.s(row[headers[18]]),
					universityType: this.s(row[headers[19]]),
					currentAggregatedCourse: this.s(row[headers[20]]),
					currentDetailedCourse: this.s(row[headers[21]]),
					currentDetailedUniversity: this.s(row[headers[22]]),
					currentCity: this.s(row[headers[23]]),
					currentState: this.s(row[headers[24]]),
					currentCountry: this.s(row[headers[25]]),
					currentAggregatedLocation: this.s(row[headers[26]]),
					currentShift: this.s(row[headers[27]]),

					// Status and Profile
					holderContractStatus: this.s(row[headers[28]]),
					realStatus: this.s(row[headers[29]]),
					realProfile: this.s(row[headers[30]]),
					hrProfile: this.s(row[headers[31]]),
					targetStatus: this.s(row[headers[32]]),
					entryProgram: this.s(row[headers[33]]),
					projectYears: this.toInt(row[headers[34]]) ?? 0,
					entryYearClass: this.s(row[headers[35]]),
					schoolNetwork: this.s(row[headers[36]]),
					school: this.s(row[headers[37]]),
					standardizedSchool: this.s(row[headers[38]]),
					groupedLocation: this.s(row[headers[39]]),
					specificLocation: this.s(row[headers[40]]),
					duplicatedTargetStatus: this.s(row[headers[41]]),
					duplicatedCurrentStatus: this.s(row[headers[42]]),
					targetAudience: this.s(row[headers[43]]),

					// Work and Opportunities
					working: this.toBool(row[headers[44]]) ?? false,
					opportunityType: this.s(row[headers[45]]) ?? undefined,
					details: this.s(row[headers[46]]) ?? undefined,
					sector: this.s(row[headers[47]]) ?? undefined,
					careerTrack: this.s(row[headers[48]]) ?? undefined,
					organization: this.s(row[headers[49]]) ?? undefined,
					website: this.s(row[headers[50]]) ?? undefined,
					startDate: this.toDateStr(row[headers[51]]) ?? undefined,
					endDate: this.toDateStr(row[headers[52]]) ?? undefined,
					compensation: this.toNumber(row[headers[53]]) ?? undefined,
					partnerCompanies: this.toBool(row[headers[54]]) ?? undefined,
					topGlobalCompanies: this.toBool(row[headers[55]]) ?? undefined,
					comments: this.s(row[headers[56]]) ?? undefined,
					tag: this.s(row[headers[57]]) ?? undefined,

					// Months (first series)
					jan: this.s(row[headers[58]]) ?? undefined,
					feb: this.s(row[headers[59]]) ?? undefined,
					mar: this.s(row[headers[60]]) ?? undefined,
					apr: this.s(row[headers[61]]) ?? undefined,
					may: this.s(row[headers[62]]) ?? undefined,
					jun: this.s(row[headers[63]]) ?? undefined,
					jul: this.s(row[headers[64]]) ?? undefined,
					aug: this.s(row[headers[65]]) ?? undefined,
					sep: this.s(row[headers[66]]) ?? undefined,
					oct: this.s(row[headers[67]]) ?? undefined,
					nov: this.s(row[headers[68]]) ?? undefined,
					dec: this.s(row[headers[69]]) ?? undefined,

					// Months (second series - full names)
					january: this.s(row[headers[70]]) ?? undefined,
					february: this.s(row[headers[71]]) ?? undefined,
					march: this.s(row[headers[72]]) ?? undefined,
					april: this.s(row[headers[73]]) ?? undefined,
					mayFull: this.s(row[headers[74]]) ?? undefined,
					june: this.s(row[headers[75]]) ?? undefined,
					july: this.s(row[headers[76]]) ?? undefined,
					august: this.s(row[headers[77]]) ?? undefined,
					september: this.s(row[headers[78]]) ?? undefined,
					october: this.s(row[headers[79]]) ?? undefined,
					november: this.s(row[headers[80]]) ?? undefined,
					december: this.s(row[headers[81]]) ?? undefined,

					// Months (third series)
					january2: this.s(row[headers[82]]) ?? undefined,
					february2: this.s(row[headers[83]]) ?? undefined,
					march2: this.s(row[headers[84]]) ?? undefined,
					april2: this.s(row[headers[85]]) ?? undefined,
					may2: this.s(row[headers[86]]) ?? undefined,
					june2: this.s(row[headers[87]]) ?? undefined,
					july2: this.s(row[headers[88]]) ?? undefined,
					august2: this.s(row[headers[89]]) ?? undefined,
					september2: this.s(row[headers[90]]) ?? undefined,
					october2: this.s(row[headers[91]]) ?? undefined,
					november2: this.s(row[headers[92]]) ?? undefined,
					december2: this.s(row[headers[93]]) ?? undefined,

					// Career Questionnaire
					internshipUnavailabilityReason: this.s(row[headers[94]]) ?? undefined,
					careerTrajectoryInterests: (() => {
						const arr = this.splitList(row[headers[95]]);
						return arr.length ? arr : undefined;
					})(),
					primaryInterest: this.s(row[headers[96]]) ?? undefined,
					secondaryInterest: this.s(row[headers[97]]) ?? undefined,
					intendedWorkingAreas: (() => {
						const arr = this.splitList(row[headers[98]]);
						return arr.length ? arr : undefined;
					})(),
					additionalAreaInterests: this.s(row[headers[99]]) ?? undefined,
					seekingProfessionalOpportunity: this.toBool(row[headers[100]]) ?? undefined,
					opportunitiesLookingFor: (() => {
						const arr = this.splitList(row[headers[101]]);
						return arr.length ? arr : undefined;
					})(),
					opportunityDetails: this.s(row[headers[102]]) ?? undefined,

					// Skills
					languages: (() => {
						const arr = this.splitList(row[headers[103]]);
						return arr.length ? arr : undefined;
					})(),
					technicalKnowledge: (() => {
						const arr = this.splitList(row[headers[104]]);
						return arr.length ? arr : undefined;
					})(),
					officePackageKnowledge: this.toBool(row[headers[105]]) ?? undefined,
					wordProficiencyLevel: this.s(row[headers[106]]) ?? undefined,
					excelProficiencyLevel: this.s(row[headers[107]]) ?? undefined,
					powerPointProficiencyLevel: this.s(row[headers[108]]) ?? undefined,
					importedFilesId: importedFilesId,

					createdAt: new Date().toISOString()
				};
			});

			if (!dbGeralData.length)
				throw new BadRequest('Nenhuma linha válida encontrada para importação. Verifique o arquivo.');

			const existing = await this.Model('students')
				.whereIn('linkedin', dbGeralData.map(d => d.linkedin))
				.whereIn('xls_id', dbGeralData.map(d => d.xls_id))
				.select('linkedin', 'id');

			dbGeralData = dbGeralData.filter(f => existing.findIndex(fi => fi.linkedin === f.linkedin) === -1);

			const insertResult = await trx('students').insert(dbGeralData).returning(['id']);

			if (!insertResult) {
				throw new Error('Erro ao inserir dados de students.');
			}

			const studentsId : number | null = Number(insertResult[0].id) ?? null;

			result.studentsId.push(studentsId);
			result.dbGeralData = dbGeralData;
		}
		catch (err: any)
		{
			console.error(err);
			result.status = 'ERROR';
			result.message = err.message || 'Erro ao processar dados de conversão.';
		}

		return result;
	}

	async insertNameLinkedin(file: FileParams, importedFilesId: number, trx: Knex.Transaction, accessToken?: string) {
		const result = {
			status: 'OK',
			message: '',
			studentsId: [] as number[],
			dbGeralData: [] as any[]
		};

		try
		{
			const workbook = XLSX.read(file.buffer, { type: 'buffer' });

			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];
			const rows = XLSX.utils.sheet_to_json(sheet);

			const headers = Object.keys(Object(rows[0]));

			const createAt = new Date().toISOString();

			for (const row of rows) {
				const typedRow = row as Record<string, any>;
				const item = {
					name: typedRow[headers[0]],
					linkedin: this.normalizeLinkedinUrl(typedRow[headers[1]]),
					createdAt: createAt,
					importedFilesId: importedFilesId
				} as ImportFiles;

				const existing = await this.Model('students').where({ linkedin: item.linkedin }).first();
				if (existing) {
					result.studentsId.push(existing.id ?? null);
					result.dbGeralData.push(item);
					continue;
				}

				const insertResult = await trx('students').insert(item).returning(['id']);

				const studentsId : number | null = Number(insertResult[0].id) ?? null;

				if (insertResult) {
					result.studentsId.push(studentsId);
					result.dbGeralData.push(item);
				}
			}
		}
		catch (err: any)
		{
			result.status = 'ERROR';
			result.message = err.message || 'Erro ao processar dados de conversão.';
		}

		return result;
	}

	private normalizeLinkedinUrl(url: string): string {
		let splited = url.split("https:");
		if (splited[1])
			url = splited[1];

		splited = url.split("http:");
		if (splited[1])
			url = splited[1];

		splited = url.split("//");
		if (splited[1])
			url = splited[1];

		splited = url.split("linkedin.com/");
		if (splited[1])
			url = splited[1];

		splited = url.split('in/');
		if (splited[1])
			url = splited[1];

		let index = url.indexOf('?');
		if (index !== -1)
			url = url.substring(0, index);
		index = url.indexOf('/');
		if (index !== -1)
			url = url.substring(0, index);

		return `https://www.linkedin.com/in/${url}`;
	}

	private s(v: any): string {
		if (v === undefined || v === null) return '';
		const str = String(v).trim();
		return str === '' || str === '-' ? '' : str;
	}

	private toNumber(v: any): number | null {
		if (v === undefined || v === null || v === '') return null;
		if (typeof v === 'number') return Number.isFinite(v) ? v : null;
		const cleaned = String(v).replace(/\./g, '').replace(',', '.').trim();
		const n = Number(cleaned);
		return Number.isFinite(n) ? n : null;
	}

	private toInt(v: any): number | null {
		const n = this.toNumber(v);
		return n === null ? null : Math.trunc(n);
	}

	private toBool(v: any): boolean | null {
		if (typeof v === 'boolean') return v;
		if (v === undefined || v === null) return null;
		const str = String(v).trim().toLowerCase();
		if (['sim', 's', 'yes', 'y', 'true', 't', '1'].includes(str)) return true;
		if (['não', 'nao', 'n', 'no', 'false', 'f', '0'].includes(str)) return false;
		return null;
	}

	private toDateStr(v: any): string | null {
		if (v === undefined || v === null) return null;
		if (v === '' || v === '-') return null;
		if (typeof v === 'number') {
			const d = XLSX.SSF.parse_date_code(v);
			if (d) {
				const mm = String(d.m).padStart(2, '0');
				const dd = String(d.d).padStart(2, '0');
				return `${d.y}-${mm}-${dd}`;
			}
			return null;
		}
		const str = String(v).trim();
		const m1 = str.match(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/);
		if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;
		const m2 = str.match(/^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/);
		if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
		const d = new Date(str);
		return isNaN(d.getTime())
			? null
			: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	private splitList(v: any): string[] {
		if (v === undefined || v === null) return [];
		if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
		return String(v)
			.split(/[,;|]/)
			.map(x => x.trim())
			.filter(Boolean);
	}
}


export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
		paginate: app.get('paginate'),
		Model: app.get('postgresqlClient'),
		name: 'import-files'
  }
}
