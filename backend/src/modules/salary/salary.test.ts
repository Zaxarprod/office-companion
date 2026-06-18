import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildYouBlock,
  computeQuotaLeft,
  FREE_QUOTA,
  salaryBucketIndex,
  synthesizeDistribution,
  widenLookup,
  type LookupFn,
  type SalaryRow,
} from './salary.logic'
import { resolveGrade, resolveRole } from './salary.resolver'

// ── resolveRole ──────────────────────────────────────────────────────────────

describe('resolveRole', () => {
  it('фронтендер → frontend', async () => {
    assert.equal(await resolveRole('фронтендер'), 'frontend')
  })

  it('Frontend разработчик → frontend', async () => {
    assert.equal(await resolveRole('Frontend разработчик'), 'frontend')
  })

  it('react dev → frontend', async () => {
    assert.equal(await resolveRole('react dev'), 'frontend')
  })

  it('бэкендер → backend', async () => {
    assert.equal(await resolveRole('бэкендер'), 'backend')
  })

  it('backend → backend', async () => {
    assert.equal(await resolveRole('backend'), 'backend')
  })

  it('java developer → backend', async () => {
    assert.equal(await resolveRole('java developer'), 'backend')
  })

  it('mobile ios developer → mobile', async () => {
    assert.equal(await resolveRole('ios developer'), 'mobile')
  })

  it('мусорный ввод не бросает исключение и возвращает null', async () => {
    const result = await resolveRole('asdfghjkl1234567 xyz мусор')
    assert.equal(result, null)
  })

  it('пустая строка → null без ошибки', async () => {
    assert.equal(await resolveRole(''), null)
  })

  it('ё → е нормализация: тестировщик → qa', async () => {
    assert.equal(await resolveRole('тестировщик'), 'qa')
  })
})

// ── resolveGrade ─────────────────────────────────────────────────────────────

describe('resolveGrade', () => {
  it('джун → junior', () => {
    assert.equal(resolveGrade('джун'), 'junior')
  })

  it('сеньор → senior', () => {
    assert.equal(resolveGrade('сеньор'), 'senior')
  })

  it('Senior (с заглавной) → senior', () => {
    assert.equal(resolveGrade('Senior'), 'senior')
  })

  it('тимлид → lead', () => {
    assert.equal(resolveGrade('тимлид'), 'lead')
  })

  it('middle → middle', () => {
    assert.equal(resolveGrade('middle'), 'middle')
  })

  it('intern → intern', () => {
    assert.equal(resolveGrade('intern'), 'intern')
  })

  it('стажёр → intern (ё-нормализация)', () => {
    assert.equal(resolveGrade('стажёр'), 'intern')
  })

  it('неизвестный грейд → null', () => {
    assert.equal(resolveGrade('архитектор'), null)
  })

  it('пустая строка → null', () => {
    assert.equal(resolveGrade(''), null)
  })
})

// ── synthesizeDistribution ───────────────────────────────────────────────────

describe('synthesizeDistribution', () => {
  const dist = synthesizeDistribution(350_000, 280_000, 450_000)

  it('возвращает ровно 10 бакетов', () => {
    assert.equal(dist.length, 10)
  })

  it('все значения в [0, 100]', () => {
    for (const b of dist) {
      assert.ok(b.value >= 0 && b.value <= 100, `Значение ${b.value} вне диапазона`)
    }
  })

  it('пик ≥ 80 (медиана ближе к центру)', () => {
    const peak = Math.max(...dist.map((b) => b.value))
    assert.ok(peak >= 80, `Пик ${peak} слишком низкий`)
  })

  it('медиана попадает в средние бакеты (3–6)', () => {
    const peak = Math.max(...dist.map((b) => b.value))
    const peakIdx = dist.findIndex((b) => b.value === peak)
    assert.ok(peakIdx >= 3 && peakIdx <= 6, `Пик на индексе ${peakIdx}`)
  })
})

// ── salaryBucketIndex ────────────────────────────────────────────────────────

describe('salaryBucketIndex', () => {
  it('возвращает индекс в пределах [0, 9]', () => {
    const idx = salaryBucketIndex(350_000, 280_000, 450_000)
    assert.ok(idx >= 0 && idx <= 9, `Индекс ${idx} вне диапазона`)
  })

  it('очень маленькая зарплата → индекс 0', () => {
    assert.equal(salaryBucketIndex(0, 280_000, 450_000), 0)
  })

  it('очень большая зарплата → индекс 9', () => {
    assert.equal(salaryBucketIndex(10_000_000, 280_000, 450_000), 9)
  })
})

// ── buildYouBlock ─────────────────────────────────────────────────────────────

describe('buildYouBlock', () => {
  it('currentSalary 250к при медиане 350к → diff -100к', () => {
    const block = buildYouBlock(250_000, 350_000, 280_000, 450_000)
    assert.equal(block.diff, -100_000)
  })

  it('diffText содержит «на 100к ниже медианы»', () => {
    const block = buildYouBlock(250_000, 350_000, 280_000, 450_000)
    assert.ok(
      block.diffText.includes('на 100к ниже медианы'),
      `Неверный diffText: ${block.diffText}`,
    )
  })

  it('зарплата выше медианы → diffText «выше медианы», diff ≥ 0', () => {
    const block = buildYouBlock(450_000, 350_000, 280_000, 450_000)
    assert.ok(block.diff >= 0, `diff должен быть ≥ 0, получили ${block.diff}`)
    assert.ok(
      block.diffText.includes('выше медианы'),
      `diffText должен содержать «выше медианы»: ${block.diffText}`,
    )
  })

  it('bucketIndex в пределах [0, 9]', () => {
    const block = buildYouBlock(300_000, 350_000, 280_000, 450_000)
    assert.ok(block.bucketIndex >= 0 && block.bucketIndex <= 9)
  })

  it('зарплата = медиана → diff 0, diffText «на 0к выше медианы»', () => {
    const block = buildYouBlock(350_000, 350_000, 280_000, 450_000)
    assert.equal(block.diff, 0)
    assert.ok(block.diffText.includes('выше медианы'))
  })
})

// ── computeQuotaLeft ──────────────────────────────────────────────────────────

describe('computeQuotaLeft', () => {
  it(`при 0 прогонах left = FREE_QUOTA (${FREE_QUOTA})`, () => {
    assert.equal(computeQuotaLeft(0, false), FREE_QUOTA)
  })

  it('после 1 прогона left уменьшается', () => {
    assert.equal(computeQuotaLeft(1, false), FREE_QUOTA - 1)
  })

  it('после FREE_QUOTA прогонов left = 0', () => {
    assert.equal(computeQuotaLeft(FREE_QUOTA, false), 0)
  })

  it('после > FREE_QUOTA прогонов left не уходит в минус', () => {
    assert.equal(computeQuotaLeft(FREE_QUOTA + 5, false), 0)
  })

  it('isPro = true → left = 999 вне зависимости от использования', () => {
    assert.equal(computeQuotaLeft(999, true), 999)
  })
})

// ── widenLookup ───────────────────────────────────────────────────────────────

describe('widenLookup', () => {
  const mockRow: SalaryRow = {
    median: 300_000,
    p25: 240_000,
    p75: 375_000,
    source: 'test-source',
    city: 'Москва',
    region: null,
  }

  it('находит по городу и возвращает coverageLabel с городом', async () => {
    const lookup: LookupFn = async (_rk, _g, scope, loc) => {
      if (scope === 'city' && loc.city === 'Москва') return mockRow
      return null
    }
    const result = await widenLookup(lookup, 'frontend', 'senior', 'Москва')
    assert.ok(result !== null)
    assert.ok(result.coverageLabel.includes('Москва'), `Нет города в лейбле: ${result.coverageLabel}`)
    assert.ok(result.coverageLabel.includes('test-source'), `Нет источника в лейбле: ${result.coverageLabel}`)
  })

  it('при отсутствии города пробует страну и возвращает «по России»', async () => {
    const countryRow: SalaryRow = { ...mockRow, city: null }
    const lookup: LookupFn = async (_rk, _g, scope) => {
      if (scope === 'country') return countryRow
      return null
    }
    const result = await widenLookup(lookup, 'frontend', 'senior', 'Мурманск')
    assert.ok(result !== null)
    assert.ok(
      result.coverageLabel.includes('по России'),
      `Ожидали «по России» в лейбле: ${result.coverageLabel}`,
    )
  })

  it('нет данных ни по городу ни по стране → null (не выдуманное число)', async () => {
    const lookup: LookupFn = async () => null
    const result = await widenLookup(lookup, 'unknown', null, 'Тьмутаракань')
    assert.equal(result, null)
  })

  it('при отсутствии грейда расширяется по grade=all', async () => {
    const allGradeRow: SalaryRow = { ...mockRow, city: null }
    const lookup: LookupFn = async (_rk, grades, scope) => {
      if (scope === 'country' && grades.includes('all')) return allGradeRow
      return null
    }
    const result = await widenLookup(lookup, 'accountant', null, 'Казань')
    assert.ok(result !== null)
  })

  it('честный ярлык при региональном widening содержит регион, не город', async () => {
    const regionRow: SalaryRow = { ...mockRow, city: null, region: 'Московская область' }
    const lookup: LookupFn = async (_rk, _g, scope, loc) => {
      if (scope === 'region' && loc.region === 'Московская область') return regionRow
      return null
    }
    const result = await widenLookup(lookup, 'frontend', 'middle', 'Москва')
    assert.ok(result !== null)
    assert.ok(
      result.coverageLabel.includes('Московская область'),
      `Ожидали регион в лейбле: ${result.coverageLabel}`,
    )
  })
})
