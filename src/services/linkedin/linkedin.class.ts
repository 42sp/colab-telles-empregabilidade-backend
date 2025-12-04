import type { Id, Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'
import { logger } from '../../logger'

import type { Application } from '../../declarations'
import type { Linkedin, LinkedinData, LinkedinPatch, LinkedinQuery } from './linkedin.schema'

export type { Linkedin, LinkedinData, LinkedinPatch, LinkedinQuery }

export interface LinkedinParams extends KnexAdapterParams<LinkedinQuery> {}

function parseDateForPostgres(value: string): string | null {
  if (!value) return null;

  // Se for 'present' (maiúsculas ou minúsculas)
  if (typeof value === 'string' && value.toLowerCase() === 'present') {
    return null; // 'YYYY-MM-DD'
  }

  // Tenta converter formatos tipo 'Sep 2024', 'September 2024', etc.
  const parsed = new Date(value);

  if (!isNaN(parsed.getTime())) {
    // Usa o primeiro dia do mês se não tiver dia definido
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = '01';
    return `${year}-${month}-${day}`;
  }

  return null; // se não conseguir converter
}

function filterIsmartAndBolsista(value: string | undefined): string | null {
  if (!value) return null;

  const str = String(value).toLowerCase();

  if (str.includes('bolsista') || str.includes('ismart')) {
    return null;
  }

  return value;
}

export class LinkedinService<ServiceParams extends Params = LinkedinParams> extends KnexService<
  Linkedin,
  LinkedinData,
  LinkedinParams,
  LinkedinPatch
> {
  async create(data: LinkedinData | LinkedinData[], params?: LinkedinParams): Promise<any> {
    const trx = await this.Model.transaction()

    try {
      const dataArray = Array.isArray(data) ? data : [data]

      if (!dataArray || dataArray.length === 0) {
        logger.info('[LinkedinService] Nenhum dado para processar.')
        return { status: 'OK', message: 'Nenhum dado para processar.' }
      }

      const createdAt = new Date().toISOString()

      for (const item of dataArray as any) {
        if (!item || !item.id) {
          logger.warn('[LinkedinService] Ignorando item sem id válido:', item)
          continue
        }

        const current_company = item.current_company as { name?: string; title?: string } | undefined

				const inputUrl = (item as any).input?.url;
				// Busca o student relacionado
        const student = await trx('students').where('linkedin', inputUrl).first()

        if (!student) {
          logger.warn('[LinkedinService] Student não encontrado mesmo com snapshot', {
            inputUrl,
            itemId: item.id
          })
          continue
        }

        logger.info('[LinkedinService] Student encontrado', {
          studentId: student.id,
        })

        const startDate = parseDateForPostgres(item.experience?.[0]?.start_date ??
          item.experience?.[0].positions?.[0]?.start_date ??
          '');
        const endDate = parseDateForPostgres(item.experience?.[0]?.end_date ??
          item.experience?.[0].positions?.[0]?.end_date ??
          '');

        // Monta dados para inserção/atualização na tabela linkedin
        const result = {
          studentId: student.id,
          company_name: current_company?.name ?? '',
          current_position: current_company?.title ?? '',
          timestamp: item.timestamp,
          data: JSON.stringify(item),
          start_date: startDate,
          is_working: !!current_company?.name && filterIsmartAndBolsista(current_company?.name) !== null,
          createdAt
        }

        // Verifica se já existe registro do linkedin
        const selectExisting = await trx('linkedin').where('studentId', student.id)
        let resultLinkedIn

        if (selectExisting.length > 0) {
          resultLinkedIn = await trx('linkedin').update(result).where('studentId', student.id)
          logger.info('[LinkedinService] Registro linkedin existente atualizado', { studentId: student.id })
        } else {
          resultLinkedIn = await trx('linkedin').insert(result)
          logger.info('[LinkedinService] Novo registro linkedin inserido', { studentId: student.id })
        }

        if (!resultLinkedIn) {
          throw new Error('Erro ao inserir dados de linkedin.')
        }

        // Atualiza dados do aluno na tabela students
        const resultStudentData = {
          working: !!current_company?.name && filterIsmartAndBolsista(current_company?.name) !== null,
          organization: filterIsmartAndBolsista(current_company?.name) ?? null,
          details: filterIsmartAndBolsista(current_company?.title) ?? null,
          startDate: filterIsmartAndBolsista(current_company?.name) !== null ? startDate : null,
          endDate: filterIsmartAndBolsista(current_company?.name) !== null ? endDate : null,
        }

        const resultStudent = await trx('students').update(resultStudentData).where('id', student.id)

        if (!resultStudent) {
          throw new Error('Erro ao atualizar dados do aluno.')
        }

        logger.info('[LinkedinService] Student atualizado', {
          studentId: student.id,
          updatedFields: Object.entries(resultStudentData)
            .filter(([key, value]) => student[key] !== value)
            .map(([key, value]) => ({ field: key, oldValue: student[key], newValue: value }))
        })
      }

      await trx.commit()
      logger.info('[LinkedinService] Processamento concluído com sucesso.')
      return { status: 'OK', message: 'Processado com sucesso!' }
    } catch (err: any) {
      await trx.rollback()
      logger.error('[LinkedinService] Erro ao processar dados de linkedin', { error: err })
      throw err
    }
  }
}

export class LinkedinDashboardService<ServiceParams extends Params = LinkedinParams> extends KnexService<
  Linkedin,
  LinkedinData,
  LinkedinParams,
  LinkedinPatch
> {
  async find(params?: LinkedinParams): Promise<any> {
    const linkedin: any = await super.find(params)
    const total_students: any = await this.Model('students').count('id', { as: 'total' }).first()
    const working_students: any = await this.Model('students')
      .where('working', true)
      .count('id', { as: 'total' })
      .first()
    const universityDistributionRaw: { name: string; value: string }[] = await this.Model('students')
      .select(this.Model.raw('"currentDetailedUniversity" as name'), this.Model.raw('COUNT(id) as value'))
      .whereNotNull('currentDetailedUniversity')
      .where('currentDetailedUniversity', '!=', '')
      .groupBy('currentDetailedUniversity')
      .orderBy('value', 'desc')
    const sectorDistributionRaw: { name: string; value: string }[] = await this.Model('students')
      .select(this.Model.raw(`"currentArea" as name`), this.Model.raw('COUNT(id) as value'))
      .groupBy('currentArea')
      .orderBy('value', 'desc')
    const organizationDistributionRaw: { name: string; value: string }[] = await this.Model('students')
      .select(this.Model.raw('organization as name'), this.Model.raw('COUNT(id) as value'))
      .whereNotNull('organization')
      .where('organization', '!=', '')
      .groupBy('organization')
      .orderBy('value', 'desc')

    const stateDistributionRaw: { name: string; value: string }[] = await this.Model('students')
      .select(this.Model.raw('"currentState" as name'), this.Model.raw('COUNT(id) as value'))
      .whereNotNull('currentState')
      .where('currentState', '!=', '')
      .groupBy('currentState')
      .orderBy('value', 'desc')

    const cityDistributionRaw: { name: string; value: string }[] = await this.Model('students')
      .select(this.Model.raw('"currentCity" as name'), this.Model.raw('COUNT(id) as value'))
      .whereNotNull('currentCity')
      .where('currentCity', '!=', '')
      .groupBy('currentCity')
      .orderBy('value', 'desc')

    const lastSynchronization: any = await this.Model('linkedin').max('createdAt as last_sync').first()

    let itemsAddedLastSync = 0
    if (lastSynchronization?.last_sync) {
      const lastSyncDate = new Date(lastSynchronization.last_sync)
      const count = await this.Model('linkedin')
        .whereRaw(
          'EXTRACT(YEAR FROM "createdAt") = ? AND EXTRACT(MONTH FROM "createdAt") = ? AND EXTRACT(DAY FROM "createdAt") = ? AND EXTRACT(HOUR FROM "createdAt") = ? AND EXTRACT(MINUTE FROM "createdAt") = ?',
          [
            lastSyncDate.getUTCFullYear(),
            lastSyncDate.getUTCMonth() + 1,
            lastSyncDate.getUTCDate(),
            lastSyncDate.getUTCHours(),
            lastSyncDate.getUTCMinutes()
          ]
        )
        .count('id as total')

      if (count && count.length > 0) {
        itemsAddedLastSync = Number(count[0].total)
      }
    }

    const studentLastCreatedAt: any = await this.Model('students').max('createdAt as last_student').first()
    const linkedinLastCreatedAt: any = await this.Model('linkedin').max('createdAt as last_linkedin').first()

    let diffString = ''
    if (studentLastCreatedAt?.last_student && linkedinLastCreatedAt?.last_linkedin) {
      const studentDate = new Date(studentLastCreatedAt.last_student)
      const linkedinDate = new Date(linkedinLastCreatedAt.last_linkedin)
      let diffMs = Math.abs(studentDate.getTime() - linkedinDate.getTime())

      const seconds = Math.floor(diffMs / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) {
        diffString = `${days} Dia${days > 1 ? 's' : ''}`
      } else if (hours > 0) {
        diffString = `${hours} Hora${hours > 1 ? 's' : ''}`
      } else if (minutes > 0) {
        diffString = `${minutes} Minuto${minutes > 1 ? 's' : ''}`
      } else {
        diffString = `${seconds} Segundo${seconds > 1 ? 's' : ''}`
      }
    }

    linkedin.data = linkedin.data.map((item: any) => {
      return {
        id: item.id,
        studentId: item.studentId,
        company_name: item.company_name,
        current_position: item.current_position,
        timestamp: item.timestamp,
        start_date: item.start_date,
        is_working: item.is_working
      }
    })

    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    async function getLinkedinEntriesLastMonth(model: any) {
      const result = await model('linkedin')
        .where('timestamp', '>=', lastMonth)
        .count('id', { as: 'total' })
        .first()
      return Number(result?.total) ?? 0
    }

    const linkedinMonth = await getLinkedinEntriesLastMonth(this.Model)

    const metrics = [
      {
        title: 'Total de Alunos',
        value: Number(total_students?.total) ?? 0,
        description: 'Desde o último mês',
        trend: Number((linkedinMonth / total_students?.total) * 100).toFixed(2)
      },
      {
        title: 'Alunos Trabalhando',
        value: Number(working_students?.total) ?? 0,
        description: `${((working_students?.total / total_students?.total) * 100).toFixed(2)}% do total de alunos`
      },
      {
        title: 'Alunos sem Trabalho',
        value: Number(total_students?.total - working_students?.total),
        description: `${(((total_students?.total - working_students?.total) / total_students?.total) * 100).toFixed(2)}% do total de alunos`
      }
    ]

    return {
      metrics,
      universityDistribution: universityDistributionRaw.map(item => ({
        name: item.name || 'Não Consta',
        value: Number(item.value)
      })),
      sectorDistribution: sectorDistributionRaw.map(item => ({
        name: item.name ? item.name : 'Não Consta',
        value: Number(item.value)
      })),
      organizationDistribution: organizationDistributionRaw.map(item => ({
        name: item.name || 'Não Consta',
        value: Number(item.value)
      })),
      stateDistribution: stateDistributionRaw.map(item => ({
        name: item.name || 'Não Consta',
        value: Number(item.value)
      })),
      cityDistribution: cityDistributionRaw.map(item => ({
        name: item.name || 'Não Consta',
        value: Number(item.value)
      })),
      statusSync: {
        lastSync: lastSynchronization?.last_sync,
        status: 'Sincronizado',
        processedRecords: itemsAddedLastSync,
        processingTime: diffString,
        nextSync: lastSynchronization?.last_sync
          ? new Date(new Date(lastSynchronization.last_sync).getTime() + 15 * 24 * 60 * 60000) // + 15 days
          : null
      }
    }
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'linkedin',
    multi: true
  }
}
