import type { VacancyDto } from '@contracts/salary'

import type { Grade } from './salary.roles'
import { GRADE_TO_HH_EXPERIENCE } from './salary.roles'

// ── Типы ответа HH API (только нужные поля) ──────────────────────────────────

/** Объект зарплаты HH (классический `salary` и новый `salary_range` — одинаковая форма). */
export interface HhSalary {
  from: number | null
  to: number | null
  currency: string | null
  gross: boolean | null
}

export interface HhVacancyItem {
  id: string
  name: string
  salary?: HhSalary | null
  /** Новое поле HH (постепенная миграция с `salary`). */
  salary_range?: HhSalary | null
  employer?: { name?: string | null } | null
  area?: { name?: string | null } | null
}

export interface HhVacanciesResponse {
  items: HhVacancyItem[]
  found: number
  pages: number
  page: number
  per_page: number
}

// ── Константы расчёта ────────────────────────────────────────────────────────

/** НДФЛ 13% — перевод gross → net (упрощённо, плоская ставка). */
const NET_FACTOR = 0.87
/** Санитарные границы месячной зарплаты — отсев опечаток/мусора (₽). */
export const MIN_SANE_SALARY = 10_000
export const MAX_SANE_SALARY = 3_000_000
/** Минимум вакансий с зарплатой, чтобы агрегат считался достоверным. */
export const MIN_SAMPLE = 5

// ── Извлечение зарплаты из вакансии ──────────────────────────────────────────

/**
 * Net-зарплата вакансии в ₽/мес или null, если посчитать нельзя.
 * Берём `salary` либо `salary_range`; считаем середину вилки; gross→net по НДФЛ;
 * валюты кроме RUR пропускаем; отсекаем явный мусор по санитарным границам.
 */
export const extractNetSalary = (item: HhVacancyItem): number | null => {
  const salary = item.salary ?? item.salary_range
  if (!salary) return null

  // Только рубли — конвертацию валют не делаем (честнее пропустить).
  const currency = (salary.currency ?? 'RUR').toUpperCase()
  if (currency !== 'RUR' && currency !== 'RUB') return null

  const { from, to } = salary
  let gross: number | null
  if (from != null && to != null) {
    gross = (from + to) / 2
  } else if (from != null) {
    gross = from
  } else if (to != null) {
    gross = to
  } else {
    gross = null
  }
  if (gross == null || !Number.isFinite(gross) || gross <= 0) return null

  // gross === null трактуем как «до вычета» (большинство вакансий в РФ так).
  const net = salary.gross === false ? gross : gross * NET_FACTOR
  const rounded = Math.round(net)

  if (rounded < MIN_SANE_SALARY || rounded > MAX_SANE_SALARY) return null
  return rounded
}

// ── Перцентили / агрегация ───────────────────────────────────────────────────

/** Перцентиль (0..1) по отсортированному по возрастанию массиву; линейная интерполяция. */
export const percentile = (sortedAsc: number[], p: number): number => {
  if (sortedAsc.length === 0) return 0
  if (sortedAsc.length === 1) return sortedAsc[0]!
  const clamped = Math.max(0, Math.min(1, p))
  const idx = (sortedAsc.length - 1) * clamped
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sortedAsc[lo]!
  const frac = idx - lo
  return Math.round(sortedAsc[lo]! * (1 - frac) + sortedAsc[hi]! * frac)
}

export interface SalaryAggregate {
  median: number
  p25: number
  p75: number
  sampleSize: number
}

/**
 * Медиана/квартили из списка net-зарплат. null, если выборка меньше MIN_SAMPLE
 * (мало данных → не выдумываем число, а откатываемся к другому источнику).
 */
export const aggregateSalaries = (salaries: number[]): SalaryAggregate | null => {
  const clean = salaries.filter((s) => Number.isFinite(s) && s > 0).sort((a, b) => a - b)
  if (clean.length < MIN_SAMPLE) return null
  return {
    median: percentile(clean, 0.5),
    p25: percentile(clean, 0.25),
    p75: percentile(clean, 0.75),
    sampleSize: clean.length,
  }
}

// ── Маппинг вакансии в DTO для карточек ──────────────────────────────────────

/** Карточка вакансии для UI: diff — разница net-зарплаты с медианой. */
export const itemToVacancyDto = (item: HhVacancyItem, median: number): VacancyDto | null => {
  const net = extractNetSalary(item)
  if (net == null) return null
  return {
    id: item.id,
    role: item.name,
    company: item.employer?.name ?? 'Компания',
    source: 'hh',
    salary: net,
    diff: net - median,
  }
}

/** Топ-N вакансий по зарплате (для таба «Крутые вакансии»). */
export const buildVacancyCards = (
  items: HhVacancyItem[],
  median: number,
  limit = 5,
): VacancyDto[] => {
  const cards = items
    .map((item) => itemToVacancyDto(item, median))
    .filter((v): v is VacancyDto => v !== null)
  // По убыванию зарплаты, без дублей по id.
  const seen = new Set<string>()
  return cards
    .sort((a, b) => b.salary - a.salary)
    .filter((v) => {
      if (seen.has(v.id)) return false
      seen.add(v.id)
      return true
    })
    .slice(0, limit)
}

// ── Города → HH area id ──────────────────────────────────────────────────────

/** Достоверные area id HH. Неизвестный город → откат к стране (113). */
export const HH_AREA_RUSSIA = 113
const CITY_TO_HH_AREA: Record<string, number> = {
  москва: 1,
  moscow: 1,
  'санкт-петербург': 2,
  питер: 2,
  спб: 2,
  'st. petersburg': 2,
  екатеринбург: 3,
  новосибирск: 4,
  'нижний новгород': 66,
  казань: 88,
}

/** area id для города или null, если город не из достоверного списка. */
export const cityToAreaId = (city: string): number | null => {
  const norm = city.toLowerCase().trim().replace(/ё/g, 'е')
  return CITY_TO_HH_AREA[norm] ?? null
}

// ── Параметры запроса HH ─────────────────────────────────────────────────────

export interface HhQuery {
  hhRoleId?: number
  /** Текстовый запрос (fallback, если у роли нет hhRoleId). */
  text?: string
  grade: Grade | null
  areaId: number
  page: number
  perPage: number
  /** Глубина свежести: вакансии за последние N дней. */
  periodDays: number
}

/** Собрать query-string для GET /vacancies. */
export const buildVacanciesQuery = (q: HhQuery): string => {
  const params = new URLSearchParams()
  if (q.hhRoleId != null) {
    params.set('professional_role', String(q.hhRoleId))
  } else if (q.text) {
    params.set('text', q.text)
  }
  if (q.grade) {
    params.set('experience', GRADE_TO_HH_EXPERIENCE[q.grade])
  }
  params.set('area', String(q.areaId))
  params.set('only_with_salary', 'true')
  params.set('per_page', String(q.perPage))
  params.set('page', String(q.page))
  params.set('period', String(q.periodDays))
  return params.toString()
}
