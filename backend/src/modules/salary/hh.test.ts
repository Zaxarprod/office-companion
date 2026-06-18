import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { fetchVacancies, type FetchLike } from './hh.client'
import {
  aggregateSalaries,
  buildVacanciesQuery,
  buildVacancyCards,
  cityToAreaId,
  extractNetSalary,
  itemToVacancyDto,
  percentile,
  type HhVacancyItem,
  MIN_SAMPLE,
} from './hh.logic'

// ── extractNetSalary ─────────────────────────────────────────────────────────

describe('extractNetSalary', () => {
  const item = (salary: HhVacancyItem['salary']): HhVacancyItem => ({
    id: '1',
    name: 'Dev',
    salary,
  })

  it('вилка from..to gross → середина минус НДФЛ', () => {
    // (200000+300000)/2 = 250000 ; net = 250000*0.87 = 217500
    assert.equal(extractNetSalary(item({ from: 200_000, to: 300_000, currency: 'RUR', gross: true })), 217_500)
  })

  it('net-зарплата (gross=false) берётся как есть', () => {
    assert.equal(extractNetSalary(item({ from: 100_000, to: 100_000, currency: 'RUR', gross: false })), 100_000)
  })

  it('gross=null трактуется как до вычета', () => {
    // 100000 * 0.87 = 87000
    assert.equal(extractNetSalary(item({ from: 100_000, to: null, currency: 'RUR', gross: null })), 87_000)
  })

  it('только from', () => {
    assert.equal(extractNetSalary(item({ from: 150_000, to: null, currency: 'RUR', gross: false })), 150_000)
  })

  it('только to', () => {
    assert.equal(extractNetSalary(item({ from: null, to: 180_000, currency: 'RUR', gross: false })), 180_000)
  })

  it('валюта не RUR → null', () => {
    assert.equal(extractNetSalary(item({ from: 5000, to: 7000, currency: 'USD', gross: false })), null)
  })

  it('RUB (синоним RUR) принимается', () => {
    assert.equal(extractNetSalary(item({ from: 90_000, to: null, currency: 'RUB', gross: false })), 90_000)
  })

  it('currency=null трактуется как рубли', () => {
    assert.equal(extractNetSalary(item({ from: 90_000, to: null, currency: null, gross: false })), 90_000)
  })

  it('пустая зарплата → null', () => {
    assert.equal(extractNetSalary(item({ from: null, to: null, currency: 'RUR', gross: true })), null)
    assert.equal(extractNetSalary(item(null)), null)
  })

  it('мусор ниже санитарной границы → null', () => {
    assert.equal(extractNetSalary(item({ from: 500, to: null, currency: 'RUR', gross: false })), null)
  })

  it('мусор выше санитарной границы → null', () => {
    assert.equal(extractNetSalary(item({ from: 9_000_000, to: null, currency: 'RUR', gross: false })), null)
  })

  it('читает salary_range, если salary отсутствует', () => {
    const it1: HhVacancyItem = {
      id: '2',
      name: 'Dev',
      salary_range: { from: 200_000, to: null, currency: 'RUR', gross: false },
    }
    assert.equal(extractNetSalary(it1), 200_000)
  })
})

// ── percentile ───────────────────────────────────────────────────────────────

describe('percentile', () => {
  it('медиана нечётного массива', () => {
    assert.equal(percentile([10, 20, 30], 0.5), 20)
  })

  it('медиана чётного массива — интерполяция', () => {
    assert.equal(percentile([10, 20, 30, 40], 0.5), 25)
  })

  it('p25 и p75', () => {
    const arr = [100, 200, 300, 400, 500]
    assert.equal(percentile(arr, 0.25), 200)
    assert.equal(percentile(arr, 0.75), 400)
  })

  it('крайние значения', () => {
    assert.equal(percentile([5, 15, 25], 0), 5)
    assert.equal(percentile([5, 15, 25], 1), 25)
  })

  it('один элемент', () => {
    assert.equal(percentile([42], 0.5), 42)
  })

  it('пустой массив → 0', () => {
    assert.equal(percentile([], 0.5), 0)
  })
})

// ── aggregateSalaries ────────────────────────────────────────────────────────

describe('aggregateSalaries', () => {
  it('меньше MIN_SAMPLE → null', () => {
    const few = Array.from({ length: MIN_SAMPLE - 1 }, (_, i) => 100_000 + i)
    assert.equal(aggregateSalaries(few), null)
  })

  it('ровно MIN_SAMPLE → агрегат', () => {
    const result = aggregateSalaries([100_000, 150_000, 200_000, 250_000, 300_000])
    assert.deepEqual(result, { median: 200_000, p25: 150_000, p75: 250_000, sampleSize: 5 })
  })

  it('сортирует вход перед расчётом', () => {
    const result = aggregateSalaries([300_000, 100_000, 250_000, 150_000, 200_000])
    assert.equal(result?.median, 200_000)
  })

  it('игнорирует невалидные значения, но они не считаются в выборку', () => {
    const result = aggregateSalaries([100_000, 200_000, 300_000, NaN, -5])
    // Остаётся 3 валидных → меньше MIN_SAMPLE → null
    assert.equal(result, null)
  })
})

// ── itemToVacancyDto / buildVacancyCards ─────────────────────────────────────

describe('vacancy cards', () => {
  const mk = (id: string, salary: number, gross = false): HhVacancyItem => ({
    id,
    name: `Role ${id}`,
    employer: { name: `Company ${id}` },
    salary: { from: salary, to: salary, currency: 'RUR', gross },
  })

  it('itemToVacancyDto считает diff от медианы', () => {
    const dto = itemToVacancyDto(mk('a', 300_000), 250_000)
    assert.equal(dto?.salary, 300_000)
    assert.equal(dto?.diff, 50_000)
    assert.equal(dto?.source, 'hh')
    assert.equal(dto?.company, 'Company a')
  })

  it('вакансия без зарплаты → null', () => {
    const dto = itemToVacancyDto({ id: 'x', name: 'X', salary: null }, 250_000)
    assert.equal(dto, null)
  })

  it('buildVacancyCards сортирует по убыванию и режет лимит', () => {
    const items = [mk('a', 200_000), mk('b', 400_000), mk('c', 300_000)]
    const cards = buildVacancyCards(items, 250_000, 2)
    assert.equal(cards.length, 2)
    assert.equal(cards[0]!.salary, 400_000)
    assert.equal(cards[1]!.salary, 300_000)
  })

  it('buildVacancyCards убирает дубли по id и пропускает беззарплатные', () => {
    const items: HhVacancyItem[] = [
      mk('a', 200_000),
      mk('a', 200_000),
      { id: 'no', name: 'No salary', salary: null },
    ]
    const cards = buildVacancyCards(items, 100_000)
    assert.equal(cards.length, 1)
  })

  it('пустой эмплойер → дефолтное название', () => {
    const dto = itemToVacancyDto({ id: 'a', name: 'A', salary: { from: 100_000, to: null, currency: 'RUR', gross: false } }, 100_000)
    assert.equal(dto?.company, 'Компания')
  })
})

// ── cityToAreaId ─────────────────────────────────────────────────────────────

describe('cityToAreaId', () => {
  it('Москва → 1', () => assert.equal(cityToAreaId('Москва'), 1))
  it('регистр и пробелы игнорируются', () => assert.equal(cityToAreaId('  москва '), 1))
  it('Питер → 2 (алиас)', () => assert.equal(cityToAreaId('Питер'), 2))
  it('ё → е: не ломается', () => assert.equal(cityToAreaId('Москва'), 1))
  it('неизвестный город → null', () => assert.equal(cityToAreaId('Урюпинск'), null))
})

// ── buildVacanciesQuery ──────────────────────────────────────────────────────

describe('buildVacanciesQuery', () => {
  it('professional_role при наличии hhRoleId', () => {
    const qs = buildVacanciesQuery({ hhRoleId: 96, grade: 'senior', areaId: 1, page: 0, perPage: 100, periodDays: 30 })
    const params = new URLSearchParams(qs)
    assert.equal(params.get('professional_role'), '96')
    assert.equal(params.get('experience'), 'moreThan6')
    assert.equal(params.get('area'), '1')
    assert.equal(params.get('only_with_salary'), 'true')
    assert.equal(params.get('period'), '30')
    assert.equal(params.get('text'), null)
  })

  it('text fallback, если нет hhRoleId', () => {
    const qs = buildVacanciesQuery({ text: 'бизнес-аналитик', grade: null, areaId: 113, page: 1, perPage: 100, periodDays: 30 })
    const params = new URLSearchParams(qs)
    assert.equal(params.get('text'), 'бизнес-аналитик')
    assert.equal(params.get('professional_role'), null)
    assert.equal(params.get('experience'), null)
    assert.equal(params.get('page'), '1')
  })
})

// ── buildVacanciesQuery: period ──────────────────────────────────────────────

describe('buildVacanciesQuery: period', () => {
  it('period=30 включён в запрос по умолчанию', () => {
    const qs = buildVacanciesQuery({ hhRoleId: 96, grade: null, areaId: 1, page: 0, perPage: 100, periodDays: 30 })
    const params = new URLSearchParams(qs)
    assert.equal(params.get('period'), '30')
  })

  it('только_with_salary=true всегда включено', () => {
    const qs = buildVacanciesQuery({ grade: null, areaId: 113, page: 0, perPage: 100, periodDays: 30 })
    const params = new URLSearchParams(qs)
    assert.equal(params.get('only_with_salary'), 'true')
  })
})

// ── fetchVacancies (инъекция fetch) ──────────────────────────────────────────

describe('fetchVacancies', () => {
  const makeItem = (id: string): HhVacancyItem => ({
    id,
    name: 'Dev',
    salary: { from: 200_000, to: 200_000, currency: 'RUR', gross: false },
  })

  it('склеивает страницы', async () => {
    const fakeFetch: FetchLike = async (url) => {
      const page = Number(new URL(url).searchParams.get('page'))
      return {
        ok: true,
        status: 200,
        json: async () => ({
          items: [makeItem(`p${page}-1`), makeItem(`p${page}-2`)],
          found: 6,
          pages: 3,
          page,
          per_page: 100,
        }),
      }
    }
    const result = await fetchVacancies({ hhRoleId: 96, grade: 'middle', areaId: 1 }, fakeFetch)
    assert.ok(result)
    assert.equal(result!.found, 6)
    assert.equal(result!.items.length, 6) // 3 страницы × 2
  })

  it('одна страница, если pages=1', async () => {
    const fakeFetch: FetchLike = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ items: [makeItem('a')], found: 1, pages: 1, page: 0, per_page: 100 }),
    })
    const result = await fetchVacancies({ hhRoleId: 96, grade: null, areaId: 1 }, fakeFetch)
    assert.equal(result!.items.length, 1)
  })

  it('HTTP-ошибка → null (откат к БД)', async () => {
    const fakeFetch: FetchLike = async () => ({ ok: false, status: 403, json: async () => ({}) })
    const result = await fetchVacancies({ hhRoleId: 96, grade: null, areaId: 1 }, fakeFetch)
    assert.equal(result, null)
  })

  it('исключение сети → null', async () => {
    const fakeFetch: FetchLike = async () => {
      throw new Error('network down')
    }
    const result = await fetchVacancies({ hhRoleId: 96, grade: null, areaId: 1 }, fakeFetch)
    assert.equal(result, null)
  })

  it('ограничивает число страниц через maxPages', async () => {
    let calls = 0
    const fakeFetch: FetchLike = async (url) => {
      calls += 1
      const page = Number(new URL(url).searchParams.get('page'))
      return {
        ok: true,
        status: 200,
        json: async () => ({ items: [makeItem(`${page}`)], found: 1000, pages: 10, page, per_page: 100 }),
      }
    }
    await fetchVacancies({ hhRoleId: 96, grade: null, areaId: 1, maxPages: 2 }, fakeFetch)
    assert.equal(calls, 2)
  })

  it('инъектированный fetch получает User-Agent и Accept', async () => {
    let capturedHeaders: Record<string, string> | undefined
    const fakeFetch: FetchLike = async (_url, init) => {
      capturedHeaders = init?.headers
      return {
        ok: true,
        status: 200,
        json: async () => ({ items: [makeItem('x')], found: 1, pages: 1, page: 0, per_page: 100 }),
      }
    }
    await fetchVacancies({ hhRoleId: 96, grade: null, areaId: 1 }, fakeFetch)
    assert.ok(capturedHeaders?.['User-Agent'])
    assert.equal(capturedHeaders?.['Accept'], 'application/json')
  })
})
