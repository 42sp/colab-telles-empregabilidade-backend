// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { ImportFiles, ImportFilesData, ImportFilesPatch, ImportFilesQuery } from './import-files.schema'

import * as XLSX from 'xlsx';

export type { ImportFiles, ImportFilesData, ImportFilesPatch, ImportFilesQuery }

export interface ImportFilesParams extends KnexAdapterParams<ImportFilesQuery> {
  file?: {
	buffer: Buffer;
	originalname: string;
	[key: string]: any;
  };
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

		const workbook = XLSX.read(file.buffer, { type: 'buffer' });
		const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'conversão');
		if (!sheetName) throw new Error('Aba "conversão" não encontrada');

		const sheet = workbook.Sheets[sheetName];
		const rows = XLSX.utils.sheet_to_json(sheet);

		const filteredRows = rows.filter((row: any) => {
			if (!row || typeof row !== 'object') return false;
			return Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '');
		});

		const conversionsData = filteredRows.map((row: any) => {
			return {
				conversionMonth: row['Mês Conversao'],
				organizationName: row['Nome da Organização'] ?? null,
				studentId: row['RA'],
				fullName: row['Nome_Completo'],
				university: row['Universidade'],
				course: row['Curso'],
				targetAudience: row['Público meta'],
				targetStatus: row['Status Meta'],
				graduationYear: isNaN(Number(row['Ano de Término'])) ? null : Number(row['Ano de Término']),
				registrationSource: row['Fonte Registro'],
				registrationDate: (function(val) {
				if (!val || val === '-' || val === '') return null;
				if (!isNaN(Number(val))) {
					const d = XLSX.SSF.parse_date_code(Number(val));
					if (d) {
					const mm = String(d.m).padStart(2, '0');
					const dd = String(d.d).padStart(2, '0');
					return `${d.y}-${mm}-${dd}`;
					}
				}
				return val;
				})(row['Data Registro']),
				opportunityType: row['Tipo Oportunidade'],
				position: row['Cargo'],
				details: row['Detalhe'] ?? null,
				sectorArea: row['Setor/ Área Oportunidade'] ?? null,
				career: row['Carreira'] ?? null,
				track: row['Trilha'] ?? null,
				organizationWebsite: row['Site_Organização'] ?? null,
				partnerCompany: row['Empresa Parceira'] === 'Sim',
				topGlobalCompanies: row['Top_Global_Empresas'] === 'Sim',
				opportunityStart: (function(val) {
				if (!val || val === '-' || val === '') return null;
				if (!isNaN(Number(val))) {
					const d = XLSX.SSF.parse_date_code(Number(val));
					if (d) {
					const mm = String(d.m).padStart(2, '0');
					const dd = String(d.d).padStart(2, '0');
					return `${d.y}-${mm}-${dd}`;
					}
				}
				return val;
				})(row['Início Oportunidade']),
				opportunityEnd: (function(val) {
				if (!val || val === '-' || val === '') return null;
				if (!isNaN(Number(val))) {
					const d = XLSX.SSF.parse_date_code(Number(val));
					if (d) {
					const mm = String(d.m).padStart(2, '0');
					const dd = String(d.d).padStart(2, '0');
					return `${d.y}-${mm}-${dd}`;
					}
				}
				return val;
				})(row['Término Oportunidade']),
				compensation: row['Remuneração'] && !isNaN(Number(row['Remuneração'])) ? Number(row['Remuneração']) : null,
				compensationSource: row['Fonte Remuneração'] ?? null,
				ismartReferral: row['Indicação_Ismart'] === 'Sim',
				opportunityStatus: row['Status_Oportunidade'],
				comments: row['Comentário'] ?? null,
				tag: row['Tag'] ?? null,
				featured: row['Destaque?'] === 'Sim',
				statusPriority: isNaN(Number(row['Prioridade Status'])) ? null : Number(row['Prioridade Status']),
				opportunityTypePriority: isNaN(Number(row['Prioridade Tipo de Oportunidade'])) ? null : Number(row['Prioridade Tipo de Oportunidade']),
				generalPriority: isNaN(Number(row['Prioridade Geral'])) ? null : Number(row['Prioridade Geral']),
				automaticVerificationFormula: row['Fórmula - verificação automática'],
				automaticVerification: row['Verificação Automática'] === 'Sim',
				timeValidation: row['Validação - Tempo'] ? row['Validação - Tempo'] === 'Sim' : false
			}
		}).filter(item => (
			item &&
			item.conversionMonth && String(item.conversionMonth).trim() !== '' &&
			item.studentId && String(item.studentId).trim() !== '' &&
			item.fullName && String(item.fullName).trim() !== ''
		));

		if (!conversionsData.length) {
			throw new Error('Nenhuma linha válida encontrada para importação. Verifique o arquivo.');
		}

		const result = await this.Model('conversions').insert(conversionsData);

		if (!result) {
			throw new Error('Erro ao inserir dados de conversão.');
		}
		return { status: 'OK', message: `${file.originalname} processado com sucesso!` };
	}
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
		paginate: app.get('paginate'),
		Model: app.get('postgresqlClient'),
		name: 'import-files'
  }
}
