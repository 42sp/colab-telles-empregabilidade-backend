import type { Id, Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'
import { logger } from '../../logger'

import type { Application } from '../../declarations'
import type { Linkedin, LinkedinData, LinkedinPatch, LinkedinQuery } from './linkedin.schema'

export type { Linkedin, LinkedinData, LinkedinPatch, LinkedinQuery }

export interface LinkedinParams extends KnexAdapterParams<LinkedinQuery> {}

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
        return { status: 'OK', message: 'Nenhum dado para processar.' }
      }

      const createdAt = new Date().toISOString()

      // Função para normalizar URLs do LinkedIn
      function normalizeLinkedinUrl(url: string | undefined) {
        if (!url) return ''
        return url
          .replace(/^https?:\/\/(www\.|fi\.)?/, '')
          .trim()
          .toLowerCase()
      }

      for (let item of dataArray) {
        if (!item || !item['id']) {
          console.warn('Skipping item without valid id:', item)
          continue
        }

        const current_company = item['current_company'] as { name?: string; title?: string } | undefined
        const snapshotId = item['snapshotId']

        const linkedinUrlRaw: string | undefined =
          typeof item['input_url'] === 'string'
            ? item['input_url']
            : typeof item['url'] === 'string'
              ? item['url']
              : undefined

        const linkedinUrl = normalizeLinkedinUrl(linkedinUrlRaw)

        logger.info('[LinkedinService] Searching student in snapshots', {
          snapshotId,
          linkedinUrlRaw,
          linkedinUrl,
          itemId: item['id']
        })

        // 🔑 Busca dupla na tabela snapshots usando URL normalizada
        let student: any
        if (snapshotId && linkedinUrl) {
          const snapshot = await trx('snapshots')
            .where('snapshot', snapshotId)
            .andWhere('linkedin', linkedinUrl)
            .first()

          if (snapshot?.studentId) {
            student = await trx('students').where('id', snapshot.studentId).first()
            logger.info('[LinkedinService] Found studentId via snapshot', {
              studentId: snapshot.studentId,
              snapshotId,
              linkedinUrl
            })
          }
        }

        if (!student) {
          logger.warn('[LinkedinService] Student not found in snapshots', {
            snapshotId,
            linkedinUrl,
            itemId: item['id']
          })
          continue
        }

        // Monta dados para inserção/atualização na tabela linkedin
        const result = {
          studentId: student.id,
          company_name: current_company?.name ?? '',
          current_position: current_company?.title ?? '',
          timestamp: item['timestamp'],
          data: JSON.stringify(item),
          start_date: '',
          is_working: !!current_company?.name,
          createdAt
        }

        // Verifica se já existe registro do linkedin
        const selectExisting = await trx('linkedin').where('studentId', student.id)
        let resultLinkedIn

        if (selectExisting.length > 0) {
          resultLinkedIn = await trx('linkedin').update(result).where('studentId', student.id)
        } else {
          resultLinkedIn = await trx('linkedin').insert(result)
        }

        if (!resultLinkedIn) {
          throw new Error('Erro ao inserir dados de linkedin.')
        }

        // Atualiza dados do aluno na tabela students
        const resultStudentData = {
          working: !!current_company?.name,
          organization: current_company?.name ?? null
        }

        const resultStudent = await trx('students').update(resultStudentData).where('id', student.id)

        if (!resultStudent) {
          throw new Error('Erro ao atualizar dados do aluno.')
        }

        logger.info('[LinkedinService] Updated student', {
          studentId: student.id,
          updatedFields: Object.entries(resultStudentData)
            .filter(([key, value]) => student[key] !== value)
            .map(([key, value]) => ({ field: key, oldValue: student[key], newValue: value }))
        })
      }

      await trx.commit()
      return { status: 'OK', message: 'Processado com sucesso!' }
    } catch (err: any) {
      await trx.rollback()
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
    const working_students: any = await this.Model('linkedin')
      .where('is_working', true)
      .count('id', { as: 'total' })
      .first()
    const employmentByMonth: any = await this.Model('linkedin')
      .select(
        this.Model.raw(`DATE_TRUNC('month', "createdAt") as month`),
        this.Model.raw(`SUM(CASE WHEN is_working THEN 1 ELSE 0 END) as trabalhando`),
        this.Model.raw(`SUM(CASE WHEN is_working = false THEN 1 ELSE 0 END) as sem_trabalho`)
      )
      .groupByRaw(`DATE_TRUNC('month', "createdAt")`)
      .orderBy('month', 'asc')
    const sectorDistributionRaw: { name: string; value: string }[] = await this.Model('students')
      .select(this.Model.raw(`"currentArea" as name`), this.Model.raw('COUNT(id) as value'))
      .groupBy('currentArea')
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
      employmentByMonth: employmentByMonth.map((item: any) => ({
        ...item,
        month: item.month
          ? new Date(item.month).toLocaleString('en-US', { month: 'short' }).replace('.', '')
          : ''
      })),
      sectorDistribution: sectorDistributionRaw.map(item => ({
        name: item.name ? item.name : 'Não Consta',
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
