import type { VacancyDto } from '@contracts/salary'

import { fetchVacancies, type FetchLike } from './hh.client'
import {
  aggregateSalaries,
  buildVacancyCards,
  cityToAreaId,
  extractNetSalary,
  HH_AREA_RUSSIA,
} from './hh.logic'
import type { Grade } from './salary.roles'

export interface HhResolved {
  median: number
  p25: number
  p75: number
  sampleSize: number
  vacancies: VacancyDto[]
  coverageLabel: string
  scope: 'city' | 'country'
  city: string | null
  /** Грейд, которым реально получены данные (мог расшириться до null при widening). */
  grade: Grade | null
}

export interface HhResolveParams {
  hhRoleId?: number
  /** Текстовый запрос (используется, если нет hhRoleId). */
  text: string
  grade: Grade | null
  city: string
}

/**
 * Актуальная вилка из HH с расширением охвата:
 * город+грейд → Россия+грейд → Россия+без грейда.
 * Первый достаточный по выборке результат, иначе null (вызов откатится к БД).
 * Не зависит от config/prisma → тестируется с инъекцией fetch.
 */
export const resolveSalaryFromHh = async (
  params: HhResolveParams,
  fetchFn?: FetchLike,
): Promise<HhResolved | null> => {
  const cityArea = cityToAreaId(params.city)
  const cityLabel = params.city.trim()

  type Attempt = { area: number; grade: Grade | null; scope: 'city' | 'country'; label: string }
  const attempts: Attempt[] = []
  if (cityArea != null) {
    attempts.push({ area: cityArea, grade: params.grade, scope: 'city', label: `по ${cityLabel} · HH.ru` })
  }
  attempts.push({ area: HH_AREA_RUSSIA, grade: params.grade, scope: 'country', label: 'по России · HH.ru' })
  if (params.grade) {
    attempts.push({ area: HH_AREA_RUSSIA, grade: null, scope: 'country', label: 'по России · HH.ru' })
  }

  for (const attempt of attempts) {
    const res = await fetchVacancies(
      {
        hhRoleId: params.hhRoleId,
        text: params.hhRoleId == null ? params.text : undefined,
        grade: attempt.grade,
        areaId: attempt.area,
        maxPages: 2,
      },
      fetchFn,
    )
    if (!res) continue
    const salaries = res.items.map(extractNetSalary).filter((n): n is number => n != null)
    const agg = aggregateSalaries(salaries)
    if (!agg) continue
    return {
      ...agg,
      vacancies: buildVacancyCards(res.items, agg.median),
      coverageLabel: attempt.label,
      scope: attempt.scope,
      city: attempt.scope === 'city' ? cityLabel : null,
      grade: attempt.grade,
    }
  }
  return null
}
