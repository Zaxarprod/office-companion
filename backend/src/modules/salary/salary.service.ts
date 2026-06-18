import type {
  CityComparisonDto,
  SalaryForkDto,
  SalaryForkInput,
  SalaryQuotaDto,
  VacancyDto,
} from '@contracts/salary'

import { config } from '../../config'
import { AppError } from '../../lib/errors'
import { prisma } from '../../prisma'

import { resolveSalaryFromHh, type HhResolved } from './hh.resolve'
import {
  DATA_MAX_AGE_MS,
  FREE_QUOTA,
  QUOTA_WINDOW_MS,
  buildYouBlock,
  computeQuotaLeft,
  synthesizeDistribution,
  widenLookup,
  type LookupFn,
  type SalaryRow,
} from './salary.logic'
import { resolveGrade, resolveRole } from './salary.resolver'
import { ROLES, type Grade } from './salary.roles'

// Seed vacancies shown in results (PRO-tizered in UI, so these are illustrative).
const SEED_VACANCIES: Record<string, VacancyDto[]> = {
  frontend: [
    { id: 'v-fe-1', role: 'Senior Frontend Developer', company: 'Авито', source: 'hh', salary: 420_000, diff: 0 },
    { id: 'v-fe-2', role: 'Middle React Developer', company: 'Яндекс', source: 'hh', salary: 300_000, diff: 0 },
    { id: 'v-fe-3', role: 'Frontend Lead', company: 'Сбер', source: 'hh', salary: 510_000, diff: 0 },
  ],
  backend: [
    { id: 'v-be-1', role: 'Senior Backend Developer', company: 'Тинькофф', source: 'hh', salary: 450_000, diff: 0 },
    { id: 'v-be-2', role: 'Python Backend Developer', company: 'ВКонтакте', source: 'hh', salary: 320_000, diff: 0 },
    { id: 'v-be-3', role: 'Go Developer', company: 'Озон', source: 'hh', salary: 490_000, diff: 0 },
  ],
  fullstack: [
    { id: 'v-fs-1', role: 'Fullstack Developer', company: 'Авито', source: 'hh', salary: 430_000, diff: 0 },
    { id: 'v-fs-2', role: 'Senior Fullstack', company: 'Яндекс', source: 'hh', salary: 410_000, diff: 0 },
    { id: 'v-fs-3', role: 'Node.js + React', company: 'Lamoda', source: 'hh', salary: 370_000, diff: 0 },
  ],
  mobile: [
    { id: 'v-mob-1', role: 'iOS Developer', company: 'Сбер', source: 'hh', salary: 470_000, diff: 0 },
    { id: 'v-mob-2', role: 'Android Developer', company: 'Авито', source: 'hh', salary: 450_000, diff: 0 },
    { id: 'v-mob-3', role: 'Flutter Developer', company: 'Тинькофф', source: 'hh', salary: 410_000, diff: 0 },
  ],
  devops: [
    { id: 'v-do-1', role: 'DevOps Engineer', company: 'Яндекс', source: 'hh', salary: 460_000, diff: 0 },
    { id: 'v-do-2', role: 'SRE Engineer', company: 'Сбер', source: 'hh', salary: 490_000, diff: 0 },
    { id: 'v-do-3', role: 'Cloud Engineer', company: 'Озон', source: 'hh', salary: 430_000, diff: 0 },
  ],
  qa: [
    { id: 'v-qa-1', role: 'QA Automation Engineer', company: 'Авито', source: 'hh', salary: 310_000, diff: 0 },
    { id: 'v-qa-2', role: 'Senior QA', company: 'Тинькофф', source: 'hh', salary: 295_000, diff: 0 },
    { id: 'v-qa-3', role: 'QA Lead', company: 'Сбер', source: 'hh', salary: 380_000, diff: 0 },
  ],
}

const DEFAULT_VACANCIES: VacancyDto[] = [
  { id: 'v-d1', role: 'Специалист', company: 'Компания А', source: 'hh', salary: 200_000, diff: 0 },
  { id: 'v-d2', role: 'Старший специалист', company: 'Компания Б', source: 'hh', salary: 280_000, diff: 0 },
  { id: 'v-d3', role: 'Ведущий специалист', company: 'Компания В', source: 'hh', salary: 350_000, diff: 0 },
]

/**
 * DB-backed lookup — passed into pure widenLookup.
 * Свежесть: отдаём только записи не старше DATA_MAX_AGE_MS (актуальность данных).
 */
const dbLookup: LookupFn = async (
  roleKey,
  grades,
  scope,
  location,
): Promise<SalaryRow | null> => {
  const freshAfter = new Date(Date.now() - DATA_MAX_AGE_MS)
  const row = await prisma.marketSalary.findFirst({
    where: {
      roleKey,
      grade: { in: grades },
      scope,
      updatedAt: { gte: freshAfter },
      ...location,
    },
    orderBy: { updatedAt: 'desc' },
  })
  if (!row) return null
  return {
    median: row.median,
    p25: row.p25,
    p75: row.p75,
    // Человекочитаемый ярлык источника для coverageLabel.
    source: row.source === 'hh-live' ? 'HH.ru' : row.source,
    city: row.city,
    region: row.region,
  }
}

// ── HH.ru как приоритетный живой источник ────────────────────────────────────

/** Обёртка над resolveSalaryFromHh с учётом флага config.hh.enabled. */
const resolveFromHh = async (params: {
  hhRoleId?: number
  text: string
  grade: Grade | null
  city: string
}): Promise<HhResolved | null> => {
  if (!config.hh.enabled) return null
  return resolveSalaryFromHh(params)
}

/** Кэшируем живой результат HH в БД (best-effort): свежий fallback на случай недоступности HH. */
const cacheHhResult = async (roleKey: string, hh: HhResolved): Promise<void> => {
  try {
    const where = {
      roleKey,
      // Грейд берём фактический (после widening), а не запрошенный — иначе
      // данные «по всем грейдам» осели бы под конкретным грейдом.
      grade: hh.grade ?? 'all',
      scope: hh.scope,
      city: hh.scope === 'city' ? hh.city : null,
      region: null,
    }
    const existing = await prisma.marketSalary.findFirst({ where })
    const data = {
      median: hh.median,
      p25: hh.p25,
      p75: hh.p75,
      sampleSize: hh.sampleSize,
      source: 'hh-live',
    }
    if (existing) {
      await prisma.marketSalary.update({ where: { id: existing.id }, data })
    } else {
      await prisma.marketSalary.create({ data: { ...where, ...data } })
    }
  } catch {
    // Кэш — не критичен: молча игнорируем сбой записи.
  }
}

export const salaryService = {
  getFork: async (userId: string, input: SalaryForkInput): Promise<SalaryForkDto> => {
    // MVP: квота не применяется — инструмент доступен без ограничений.
    // usageEvent создаётся ниже для аналитики, но не блокирует доступ.

    const [roleKey, grade] = await Promise.all([
      resolveRole(input.profession),
      Promise.resolve(resolveGrade(input.grade)),
    ])

    const roleMeta = roleKey ? ROLES.find((r) => r.key === roleKey) : undefined

    // 1. Приоритет — живые данные HH.ru.
    const hh = await resolveFromHh({
      hhRoleId: roleMeta?.hhRoleId,
      text: roleMeta?.label ?? input.profession,
      grade,
      city: input.city,
    })

    let median: number
    let p25: number
    let p75: number
    let coverageLabel: string
    let vacancies: VacancyDto[]

    if (hh) {
      median = hh.median
      p25 = hh.p25
      p75 = hh.p75
      coverageLabel = hh.coverageLabel
      vacancies = hh.vacancies
      // Кэшируем (best-effort) — только для распознанной роли.
      if (roleKey) {
        await cacheHhResult(roleKey, hh)
      }
    } else {
      // 2. Откат — свежий кэш/сид в БД (не старше года).
      const widened = roleKey ? await widenLookup(dbLookup, roleKey, grade, input.city) : null
      if (!widened) {
        throw new AppError(
          422,
          'NO_DATA',
          `Нет данных для «${input.profession}» в «${input.city}» — попробуй другую профессию или город`,
        )
      }
      median = widened.row.median
      p25 = widened.row.p25
      p75 = widened.row.p75
      coverageLabel = widened.coverageLabel
      const rawVacancies = SEED_VACANCIES[roleKey ?? ''] ?? DEFAULT_VACANCIES
      vacancies = rawVacancies.map((v) => ({ ...v, diff: v.salary - median }))
    }

    const distribution = synthesizeDistribution(median, p25, p75)
    const gradeCapital = grade ? grade.charAt(0).toUpperCase() + grade.slice(1) : null
    const roleLabel = gradeCapital
      ? `${gradeCapital} · ${roleMeta?.label ?? input.profession}`
      : (roleMeta?.label ?? input.profession)

    const you =
      input.currentSalary != null
        ? buildYouBlock(input.currentSalary, median, p25, p75)
        : undefined

    await prisma.usageEvent.create({ data: { userId, tool: 'salary' } })

    return {
      role: roleLabel,
      median,
      range: [p25, p75],
      distribution,
      you,
      vacancies,
      coverageLabel,
    }
  },

  getCities: async (_userId: string, _input: SalaryForkInput): Promise<CityComparisonDto[]> => {
    // PRO tizzer: returns city-scope senior rows sorted by median desc.
    // Только свежие записи (не старше года) — иначе вводим в заблуждение.
    const freshAfter = new Date(Date.now() - DATA_MAX_AGE_MS)
    const rows = await prisma.marketSalary.findMany({
      where: {
        scope: 'city',
        grade: { in: ['senior', 'all'] },
        updatedAt: { gte: freshAfter },
      },
      orderBy: { median: 'desc' },
      take: 6,
    })
    if (rows.length === 0) {
      return [
        { city: 'Москва', median: 390_000, diff: 0 },
        { city: 'Санкт-Петербург', median: 310_000, diff: -80_000 },
        { city: 'Екатеринбург', median: 250_000, diff: -140_000 },
        { city: 'Новосибирск', median: 245_000, diff: -145_000 },
      ]
    }
    const base = rows[0]?.median ?? 390_000
    const seen = new Set<string>()
    return rows
      .filter((r) => {
        if (!r.city || seen.has(r.city)) return false
        seen.add(r.city)
        return true
      })
      .map((row) => ({
        city: row.city ?? '',
        median: row.median,
        diff: row.median - base,
      }))
  },

  getQuota: async (userId: string): Promise<SalaryQuotaDto> => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } })
    if (user?.isPro) {
      return {
        left: 999,
        total: 999,
        resetAt: new Date(Date.now() + QUOTA_WINDOW_MS).toISOString(),
      }
    }
    const since = new Date(Date.now() - QUOTA_WINDOW_MS)
    const used = await prisma.usageEvent.count({
      where: { userId, tool: 'salary', createdAt: { gte: since } },
    })
    return {
      left: computeQuotaLeft(used, false),
      total: FREE_QUOTA,
      resetAt: new Date(since.getTime() + QUOTA_WINDOW_MS).toISOString(),
    }
  },
}
