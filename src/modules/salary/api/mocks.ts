import { registerMock } from '~/shared/api'

import type {
  CityComparison,
  SalaryFork,
  SalaryForkInput,
  SalaryQuotaDto,
} from '../types'

const distribution = [18, 26, 40, 60, 82, 100, 88, 62, 42, 24].map((value) => ({ value }))

registerMock<SalaryForkInput, SalaryFork>('POST', '/salary/fork', (input) => {
  const median = 350_000
  const you = input.currentSalary
    ? {
        bucketIndex: 1,
        diff: input.currentSalary - median,
        diffText: `Ты ${Math.round(input.currentSalary / 1000)}к — на ${Math.round(
          (median - input.currentSalary) / 1000,
        )}к ниже медианы`,
      }
    : undefined

  return {
    role: `${input.grade} · ${input.profession} · ${input.city}`,
    median,
    range: [280_000, 450_000],
    distribution,
    you,
    vacancies: [
      { id: 'v1', role: 'Senior Frontend', company: 'Авито', source: 'hh', salary: 420_000, diff: 130_000 },
      { id: 'v2', role: 'Frontend Lead', company: 'Яндекс', source: 'hh', salary: 480_000, diff: 190_000 },
      { id: 'v3', role: 'Senior React', company: 'Тинькофф', source: 'hh', salary: 390_000, diff: 100_000 },
    ],
    coverageLabel: `по ${input.city} · ручной сид`,
  }
})

registerMock<SalaryForkInput, CityComparison[]>('POST', '/salary/cities', () => [
  { city: 'Москва', median: 350_000, diff: 0 },
  { city: 'Санкт-Петербург', median: 310_000, diff: -40_000 },
  { city: 'Дубай', median: 520_000, diff: 170_000 },
  { city: 'Берлин', median: 610_000, diff: 260_000 },
])

registerMock<void, SalaryQuotaDto>('GET', '/salary/quota', () => ({
  left: 2,
  total: 3,
  resetAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
}))
