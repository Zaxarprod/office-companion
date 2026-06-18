import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import type { FetchLike } from './hh.client'
import { resolveSalaryFromHh } from './hh.resolve'

// Фейковый fetch: по area+experience решает, отдать ли «достаточную» выборку.
// sufficient(area, experience|null) → массив зарплат (или []).
const makeFetch = (
  sufficient: (area: string, experience: string | null) => number[],
): { fetch: FetchLike; calls: { area: string; experience: string | null }[] } => {
  const calls: { area: string; experience: string | null }[] = []
  const fetch: FetchLike = async (url) => {
    const params = new URL(url).searchParams
    const area = params.get('area') ?? ''
    const experience = params.get('experience')
    calls.push({ area, experience })
    const salaries = sufficient(area, experience)
    const items = salaries.map((s, i) => ({
      id: `${area}-${experience}-${i}`,
      name: 'Dev',
      salary: { from: s, to: s, currency: 'RUR', gross: false },
    }))
    return {
      ok: true,
      status: 200,
      json: async () => ({ items, found: items.length, pages: 1, page: 0, per_page: 100 }),
    }
  }
  return { fetch, calls }
}

const sample = (value: number, n = 6): number[] => Array.from({ length: n }, () => value)

describe('resolveSalaryFromHh', () => {
  it('город+грейд достаточно → scope city, грейд сохранён', async () => {
    const { fetch, calls } = makeFetch((area) => (area === '1' ? sample(200_000) : []))
    const result = await resolveSalaryFromHh(
      { hhRoleId: 96, text: 'frontend', grade: 'senior', city: 'Москва' },
      fetch,
    )
    assert.ok(result)
    assert.equal(result!.scope, 'city')
    assert.equal(result!.city, 'Москва')
    assert.equal(result!.grade, 'senior')
    assert.equal(result!.median, 200_000)
    assert.equal(result!.coverageLabel, 'по Москва · HH.ru')
    // Первая же попытка — город+senior.
    assert.deepEqual(calls[0], { area: '1', experience: 'moreThan6' })
  })

  it('город пуст → пробует Россию с грейдом', async () => {
    const { fetch } = makeFetch((area, exp) =>
      area === '113' && exp === 'between3And6' ? sample(180_000) : [],
    )
    const result = await resolveSalaryFromHh(
      { hhRoleId: 96, text: 'frontend', grade: 'middle', city: 'Москва' },
      fetch,
    )
    assert.ok(result)
    assert.equal(result!.scope, 'country')
    assert.equal(result!.city, null)
    assert.equal(result!.grade, 'middle')
    assert.equal(result!.coverageLabel, 'по России · HH.ru')
  })

  it('хватает только страны без грейда → grade=null (важно для корректного кэша)', async () => {
    // Город и страна+грейд пусты; срабатывает только страна без experience.
    const { fetch, calls } = makeFetch((area, exp) =>
      area === '113' && exp === null ? sample(150_000) : [],
    )
    const result = await resolveSalaryFromHh(
      { hhRoleId: 96, text: 'frontend', grade: 'senior', city: 'Москва' },
      fetch,
    )
    assert.ok(result)
    assert.equal(result!.scope, 'country')
    assert.equal(result!.grade, null) // НЕ 'senior' — данные по всем грейдам
    // Порядок попыток: город+senior, Россия+senior, Россия+null.
    assert.equal(calls.length, 3)
    assert.deepEqual(calls[2], { area: '113', experience: null })
  })

  it('нигде нет данных → null', async () => {
    const { fetch } = makeFetch(() => [])
    const result = await resolveSalaryFromHh(
      { hhRoleId: 96, text: 'frontend', grade: 'senior', city: 'Москва' },
      fetch,
    )
    assert.equal(result, null)
  })

  it('неизвестный город → сразу страна, без городской попытки', async () => {
    const { fetch, calls } = makeFetch((area) => (area === '113' ? sample(170_000) : []))
    const result = await resolveSalaryFromHh(
      { hhRoleId: 96, text: 'frontend', grade: null, city: 'Урюпинск' },
      fetch,
    )
    assert.ok(result)
    assert.equal(result!.scope, 'country')
    // Городской попытки нет (город неизвестен) → первый запрос сразу area=113.
    assert.equal(calls[0]!.area, '113')
  })

  it('без грейда: только 2 попытки (город + страна), без дубля страны', async () => {
    const { fetch, calls } = makeFetch(() => [])
    await resolveSalaryFromHh(
      { hhRoleId: 96, text: 'frontend', grade: null, city: 'Москва' },
      fetch,
    )
    assert.equal(calls.length, 2)
    assert.deepEqual(calls[0], { area: '1', experience: null })
    assert.deepEqual(calls[1], { area: '113', experience: null })
  })

  it('строит карточки вакансий из живых items', async () => {
    const { fetch } = makeFetch((area) => (area === '1' ? sample(200_000, 8) : []))
    const result = await resolveSalaryFromHh(
      { hhRoleId: 96, text: 'frontend', grade: 'senior', city: 'Москва' },
      fetch,
    )
    assert.ok(result!.vacancies.length > 0)
    assert.equal(result!.vacancies[0]!.source, 'hh')
  })
})
