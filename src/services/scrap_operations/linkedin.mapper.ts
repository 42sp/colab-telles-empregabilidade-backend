import { logger } from '../../logger'

export interface BrightDataProfile {
  id?: string
  url?: string
  input_url?: string
  name?: string
  first_name?: string
  last_name?: string
  position?: string
  current_company?: {
    name?: string
    location?: string | null
  }
  city?: string
  country_code?: string
  location?: string
  experience?: any
  education?: any
  followers?: number
  connections?: number
  avatar?: string
}

/**
 * Função de utilidade para inferir se a pessoa está "working"
 */
function inferWorking(profile: BrightDataProfile): boolean {
  const result = Boolean(profile.position || profile.current_company?.name)
  logger.debug('[LinkedinMapper] inferWorking', {
    position: profile.position,
    company: profile.current_company?.name,
    working: result
  })
  return result
}

/**
 * Função de utilidade para inferir setor a partir do cargo
 */
function inferSectorFromPosition(position?: string): string | null {
  if (!position) return null
  const p = position.toLowerCase()

  if (p.includes('engineer') || p.includes('developer') || p.includes('software')) return 'Tecnologia'
  if (p.includes('design')) return 'Design'
  if (p.includes('marketing')) return 'Marketing'
  if (p.includes('product')) return 'Produto'
  if (p.includes('finance') || p.includes('account')) return 'Finanças'
  if (p.includes('hr') || p.includes('recruit')) return 'Recursos Humanos'

  return 'Outros'
}

/**
 * Mapeia retorno do Bright Data → dados atualizáveis no students
 */
export function mapBrightDataToStudentUpdate(profile: BrightDataProfile) {
  logger.info('[LinkedinMapper] Mapping BrightData profile', {
    id: profile.id,
    url: profile.url || profile.input_url,
    // só loga name para referência, não atualiza
    name: profile.name 
  })

  const update: Record<string, any> = {}

  // 🔹 Profissional
  if (profile.position) {
    update.details = profile.position
    logger.debug('[LinkedinMapper] Detected position', { position: profile.position })
  }

  if (profile.current_company?.name) {
    update.organization = profile.current_company.name
    logger.debug('[LinkedinMapper] Detected company', { company: profile.current_company.name })
  }

  if (profile.current_company?.location) {
    update.specificLocation = profile.current_company.location
    logger.debug('[LinkedinMapper] Detected company location', { location: profile.current_company.location })
  }

  update.working = inferWorking(profile)

  const sector = inferSectorFromPosition(profile.position)
  if (sector) {
    update.sector = sector
    logger.debug('[LinkedinMapper] Inferred sector', { sector })
  }

  // 🔹 Localização geral
  if (profile.city) {
    update.currentCity = profile.city
    logger.debug('[LinkedinMapper] Detected city', { city: profile.city })
  }

  if (profile.country_code) {
    update.currentCountry = profile.country_code
    logger.debug('[LinkedinMapper] Detected country', { country: profile.country_code })
  }

  if (profile.location) {
    update.currentAggregatedLocation = profile.location
    logger.debug('[LinkedinMapper] Detected aggregated location', { location: profile.location })
  }

  logger.info('[LinkedinMapper] Final update object', { update })

  return update
}
