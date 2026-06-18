import type { VacancyDto } from '@contracts/salary'

import type { Grade } from './salary.roles'
import { GRADE_TO_HH_EXPERIENCE } from './salary.roles'

// ── Типы ответа HH API (только нужные поля) ──────────────────────────────────

/**
 * Устаревший объект зарплаты HH (`salary`, deprecated с 2024).
 * `gross` и `currency` могут быть null в старых записях.
 */
export interface HhSalaryLegacy {
  from: number | null
  to: number | null
  currency: string | null
  gross: boolean | null
}

/**
 * Новый объект зарплаты HH (`salary_range`).
 * `mode.id` указывает гранулярность: `MONTH` | `HOUR` | `SHIFT` | `FLY_IN_FLY_OUT` | `SERVICE`.
 * Принимаем только `MONTH`; остальные режимы — не сопоставимы с месячной зарплатой.
 */
export interface HhSalaryRange {
  from: number | null
  to: number | null
  /** Всегда присутствует в salary_range (не nullable, в отличие от salary.currency). */
  currency: string
  /** Всегда присутствует в salary_range (не nullable, в отличие от salary.gross). */
  gross: boolean
  mode: { id: string; name?: string }
  frequency?: { id: string; name?: string } | null
}

export interface HhVacancyItem {
  id: string
  name: string
  /** Устаревшее поле (deprecated). Используем как запасной вариант, если salary_range отсутствует. */
  salary?: HhSalaryLegacy | null
  /** Актуальное поле. Приоритет над salary; содержит mode (гранулярность). */
  salary_range?: HhSalaryRange | null
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
 *
 * Приоритет: `salary_range` (актуальный, имеет mode) → `salary` (deprecated, fallback).
 * Из salary_range принимаем только mode=MONTH; HOUR/SHIFT/FLY_IN_FLY_OUT/SERVICE — отбрасываем:
 * эти суммы не сопоставимы с месячной зарплатой и исказят медиану.
 * Валюты кроме RUR/RUB пропускаем; gross→net по НДФЛ 13%; отсекаем мусор по санитарным границам.
 */
export const extractNetSalary = (item: HhVacancyItem): number | null => {
  // Сначала пробуем актуальное поле salary_range.
  if (item.salary_range) {
    // Принимаем только месячные суммы; иначе результат нельзя сравнить с медианой.
    if (item.salary_range.mode?.id !== 'MONTH') return null
    return extractFromSalaryFields(item.salary_range.from, item.salary_range.to, item.salary_range.currency, item.salary_range.gross)
  }

  // Fallback к устаревшему полю salary (всегда месячная сумма, mode отсутствует).
  if (item.salary) {
    return extractFromSalaryFields(item.salary.from, item.salary.to, item.salary.currency ?? 'RUR', item.salary.gross)
  }

  return null
}

/** Общая логика извлечения net-зарплаты из произвольных числовых полей. */
const extractFromSalaryFields = (
  from: number | null,
  to: number | null,
  currency: string,
  gross: boolean | null,
): number | null => {
  // Только рубли — конвертацию валют не делаем (честнее пропустить).
  if (currency.toUpperCase() !== 'RUR' && currency.toUpperCase() !== 'RUB') return null

  let amount: number | null
  if (from != null && to != null) {
    amount = (from + to) / 2
  } else if (from != null) {
    amount = from
  } else if (to != null) {
    amount = to
  } else {
    amount = null
  }
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null

  // gross === null трактуем как «до вычета» (большинство вакансий в РФ так).
  const net = gross === false ? amount : amount * NET_FACTOR
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
