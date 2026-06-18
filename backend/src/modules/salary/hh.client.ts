import {
  buildVacanciesQuery,
  type HhQuery,
  type HhVacanciesResponse,
  type HhVacancyItem,
} from './hh.logic'

// HH-настройки читаем напрямую из env (без строгого config), чтобы модуль
// импортировался в юнит-тестах без DATABASE_URL/JWT_SECRET.
const HH_API_BASE = process.env.HH_API_BASE ?? 'https://api.hh.ru'
// HH требует осмысленный User-Agent, иначе режет запросы.
const HH_USER_AGENT = process.env.HH_USER_AGENT ?? 'derzhimsya/1.0 (zakhar.production@gmail.com)'
// Bearer-токен приложения HH (client_credentials). Получить: dev.hh.ru → Мои приложения.
// Без токена /vacancies возвращает 403 — код откатится к БД.
const HH_APP_TOKEN = process.env.HH_APP_TOKEN ?? ''

/** Совместимо с глобальным fetch — инъектируется в тестах. */
export type FetchLike = (url: string, init?: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<{
  ok: boolean
  status: number
  json: () => Promise<unknown>
}>

const REQUEST_TIMEOUT_MS = 6000
const MAX_PAGES = 3
const PER_PAGE = 100
const PERIOD_DAYS = 30

export interface HhFetchOptions {
  hhRoleId?: number
  text?: string
  grade: HhQuery['grade']
  areaId: number
  /** Сколько страниц максимум (по 100 вакансий). */
  maxPages?: number
}

export interface HhFetchResult {
  items: HhVacancyItem[]
  found: number
}

/** Один запрос страницы вакансий к HH. Бросает при сетевой/HTTP-ошибке. */
const fetchPage = async (
  fetchFn: FetchLike,
  options: HhFetchOptions,
  page: number,
): Promise<HhVacanciesResponse> => {
  const query = buildVacanciesQuery({
    hhRoleId: options.hhRoleId,
    text: options.text,
    grade: options.grade,
    areaId: options.areaId,
    page,
    perPage: PER_PAGE,
    periodDays: PERIOD_DAYS,
  })
  const url = `${HH_API_BASE}/vacancies?${query}`
  const headers: Record<string, string> = {
    'User-Agent': HH_USER_AGENT,
    Accept: 'application/json',
  }
  if (HH_APP_TOKEN) {
    headers['Authorization'] = `Bearer ${HH_APP_TOKEN}`
  }
  const response = await fetchFn(url, {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`HH API ${response.status}`)
  }
  const data = (await response.json()) as HhVacanciesResponse
  return data
}

/**
 * Забрать вакансии по роли/грейду/региону с пагинацией.
 * Страница 0 — синхронно (узнаём pages), остальные — параллельно.
 * Возвращает null при любой ошибке (сеть/таймаут/HTTP) — вызов откатится к БД.
 */
export const fetchVacancies = async (
  options: HhFetchOptions,
  fetchFn: FetchLike = globalThis.fetch as unknown as FetchLike,
): Promise<HhFetchResult | null> => {
  try {
    const first = await fetchPage(fetchFn, options, 0)
    const maxPages = Math.min(options.maxPages ?? MAX_PAGES, first.pages || 1)
    const items = [...first.items]

    if (maxPages > 1) {
      const rest = await Promise.all(
        Array.from({ length: maxPages - 1 }, (_, i) => fetchPage(fetchFn, options, i + 1)),
      )
      for (const pageData of rest) {
        items.push(...pageData.items)
      }
    }

    return { items, found: first.found }
  } catch {
    return null
  }
}
