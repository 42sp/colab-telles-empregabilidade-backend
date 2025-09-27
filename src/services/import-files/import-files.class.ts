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
import { createStudentsObject } from './import-files.utils'

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
  async create(data: ImportFilesData | ImportFilesData[], params?: ImportFilesParams): Promise<any> {
		const file = params?.file || (params as any)?.files?.file || (params as any)?.files?.[0];
		if (!file) throw new Error('Nenhum arquivo enviado');

		let result = {
			status: 'OK',
			message: '',
			studentsId: [] as number[],
			dbGeralData: [] as any[]
		};

		const trx = await this.Model.transaction();
		let importedFileId: number | null = null;

		try
		{
			const accessToken = params?.authentication?.accessToken;

			console.log('Step 1: Inserting imported file...');
			importedFileId = await this.insertImportedFile(file, String(params?.user?.id ?? ''), trx);
			console.log('Step 1 completed - Imported file ID:', importedFileId);

			if (!importedFileId) {
				throw new Error('Failed to get imported file ID');
			}

			console.log('Step 2: Inserting BD Geral data...');
			result = await this.insertBdGeral(file, importedFileId, trx, accessToken);
			console.log('Step 2 completed - Students data status:', result.status);

			console.log('Step 3: Inserting conversions data...');
			const conversionsResult = await this.insertConversionsData(file, importedFileId, trx);
			console.log('Step 3 completed - Conversions status:', conversionsResult.status);

			if (result.status === 'EMPTY') {
				console.log('Step 4: Inserting Name LinkedIn data...');
				result = await this.insertNameLinkedin(file, importedFileId, trx, accessToken);
				console.log('Step 4 completed - Students data status:', result.status);
			}

			if (result.status === 'ERROR') {
				throw new Error(`Error in insertNameLinkedin: ${result.message}`);
			}


			console.log('Step 5: Posting LinkedIn data...');
			result = await this.postLinkedIn(result.dbGeralData, trx, params?.authentication?.accessToken);
			console.log('Step 5 completed - PostLinkedIn status:', result.status);

			if (result.status === 'OK') {
				console.log('All steps completed successfully, committing transaction...');
				// throw new Error("rollback");
				await trx.commit();
				result.message = `${file.originalname} processado com sucesso!`;
			}
			else {
				console.log('Error in final step, rolling back transaction...');
				await trx.rollback();
				result.message = `${file.originalname} processado com erros: ${result.message}`;
			}
		}
		catch(err: any)
		{
			console.error('Error in create method:', err);
			try {
				await trx.rollback();
			} catch (rollbackError) {
				console.error('Error during rollback:', rollbackError);
			}
			throw err;
		}
		return result;
	}

	async insertImportedFile(file: FileParams, userId: string, trx: Knex.Transaction): Promise<number> {
		const obj = {
			fileName: file.originalname,
			importationDate: new Date().toISOString(),
			userId: userId
		 } as ImportedFiles;

		const result = await trx('imported-files').insert(obj).returning(['id']);

		if (!result || !result[0] || !result[0].id) {
			throw new Error('Erro ao inserir arquivo importado - ID não retornado.');
		}

		return result[0].id;
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
			if (!sheetName) {
				result.status = 'EMPTY';
				result.message = 'Aba "conversão" não possui dados para importar.';
				return result;
			}

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

			const insertResult = await trx('conversions').insert(conversionsData);

			if (!insertResult) {
				result.status = 'ERROR';
				result.message = 'Erro ao inserir dados de conversão.';
			}
		}
		catch(err: any) {
			result.status = 'ERROR';
			result.message = err.message || 'Erro ao processar dados de conversão.';
		}

		return result;
	}

	async postLinkedIn(dbGeralData: any[], trx: Knex.Transaction, accessToken?: string) {
		const $service = useServices();

		const result = {
			status: 'OK',
			message: '',
			studentsId: [] as number[],
			dbGeralData: [] as any[]
		};

		try
		{
			const chunkSize = 10;
			for (let i = 0; i < dbGeralData.length; i += chunkSize) {
				const chunk = dbGeralData.slice(i, i + chunkSize);

				const validChunk =	chunk
						.map(m => m.linkedin)
						.filter(linkedin => {
							if (typeof linkedin !== 'string') return false;
							const prefix = 'https://www.linkedin.com/in/';
							if (!linkedin.startsWith(prefix)) return false;
							const after = linkedin.slice(prefix.length);
							return after.length > 0;
						});
				if (validChunk.length === 0) continue;
				console.log(validChunk);
				// const response = await $service.searchLinkedIn(
				// 	{ urls: chunk.map(m => ({ url: m.linkedin })) },
				// 	String(accessToken)
				// );

				// if (response?.data?.snapshot_id)
				// {
				// 	await trx("snapshots").insert(chunk.map(m => (
				// 		{
				// 			linkedin: m.linkedin,
				// 			snapshot: response.data.snapshot_id
				// 		}
				// 	)));
				// }
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
			if (!sheetName) {
				result.status = 'EMPTY';
				result.message = 'Aba "bd_geral" não possui dados para importar.';
				return result;
			}

			const sheet = workbook.Sheets[sheetName];
			const rows = XLSX.utils.sheet_to_json(sheet, { range: 1 });
			const headers = Object.keys(Object(rows[0]));
			const filteredRows = rows.filter((row: any) => {
				if (!row || typeof row !== 'object') return false;
				return Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '');
			});

			let dbGeralData = filteredRows.map((row: any, index: number) => {
				return {
					...createStudentsObject(this, row),
					importedFilesId: importedFilesId
				}
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

			if (!sheetName) {
				result.status = 'EMPTY';
				result.message = 'Aba não possui dados para importar.';
				return result;
			}
			const sheet = workbook.Sheets[sheetName];
			const rows = XLSX.utils.sheet_to_json(sheet);
			const headers = Object.keys(Object(rows[0]));

			const createAt = new Date().toISOString();

			for (const row of rows) {
				const typedRow = row as Record<string, any>;
				const item = {
					name: typedRow[headers.find(f => f.includes("NOME")) ?? "NOME"],
					linkedin: this.normalizeLinkedinUrl(typedRow[headers.find(f => f.includes("LinkedIn")) ?? "LinkedIn"]),
					createdAt: createAt,
					importedFilesId: importedFilesId
				};

				console.log(item)

				const existing = await this.Model('students').where({ linkedin: item.linkedin }).first();
				if (existing) {
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

	public normalizeLinkedinUrl(url: string): string {
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

	public s(v: any): string {
		if (v === undefined || v === null) return '';
		const str = String(v).trim();
		return str === '' || str === '-' ? '' : str;
	}

	public toNumber(v: any): number | null {
		if (v === undefined || v === null || v === '') return null;
		if (typeof v === 'number') return Number.isFinite(v) ? v : null;
		const cleaned = String(v).replace(/\./g, '').replace(',', '.').trim();
		const n = Number(cleaned);
		return Number.isFinite(n) ? n : null;
	}

	public toInt(v: any): number | null {
		const n = this.toNumber(v);
		return n === null ? null : Math.trunc(n);
	}

	public toBool(v: any): boolean | null {
		if (typeof v === 'boolean') return v;
		if (v === undefined || v === null) return null;
		const str = String(v).trim().toLowerCase();
		if (['sim', 's', 'yes', 'y', 'true', 't', '1'].includes(str)) return true;
		if (['não', 'nao', 'n', 'no', 'false', 'f', '0'].includes(str)) return false;
		return null;
	}

	public toDateStr(v: any): string | null {
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

	public splitList(v: any): string[] {
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
