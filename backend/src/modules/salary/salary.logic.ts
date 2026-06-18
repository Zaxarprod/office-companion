import type { DistributionBucketDto, SalaryForkDto } from '@contracts/salary'

const BUCKET_COUNT = 10

/**
 * Synthesize histogram from median + p25/p75.
 * Returns BUCKET_COUNT buckets with bell-curve shape peaked at median.
 */
export const synthesizeDistribution = (
  median: number,
  p25: number,
  p75: number,
): DistributionBucketDto[] => {
  const spread = p75 - p25
  const halfSpread = spread > 0 ? spread : median * 0.2
  const minBound = p25 - halfSpread * 0.5
  const maxBound = p75 + halfSpread * 0.5
  const bucketSize = (maxBound - minBound) / BUCKET_COUNT
  const sigma = halfSpread * 0.6

  return Array.from({ length: BUCKET_COUNT }, (_, i) => {
    const center = minBound + (i + 0.5) * bucketSize
    const z = sigma > 0 ? (center - median) / sigma : 0
    const raw = Math.exp(-0.5 * z * z)
    return { value: Math.round(raw * 100) }
  })
}

export interface DistributionBounds {
  min: number
  max: number
}

export const getDistributionBounds = (p25: number, p75: number): DistributionBounds => {
  const spread = p75 - p25
  const halfSpread = spread > 0 ? spread : p25 * 0.2
  return {
    min: Math.round(p25 - halfSpread * 0.5),
    max: Math.round(p75 + halfSpread * 0.5),
  }
}

/** Bucket index (0-based) for a salary value within the distribution range. */
export const salaryBucketIndex = (salary: number, p25: number, p75: number): number => {
  const { min, max } = getDistributionBounds(p25, p75)
  const bucketSize = (max - min) / BUCKET_COUNT
  if (bucketSize <= 0) return Math.floor(BUCKET_COUNT / 2)
  const idx = Math.floor((salary - min) / bucketSize)
  return Math.max(0, Math.min(BUCKET_COUNT - 1, idx))
}

/** Build the "you" block comparing current salary to median. */
export const buildYouBlock = (
  currentSalary: number,
  median: number,
  p25: number,
  p75: number,
): NonNullable<SalaryForkDto['you']> => {
  const diff = currentSalary - median
  const diffK = Math.round(Math.abs(diff) / 1000)
  const youK = Math.round(currentSalary / 1000)

  const diffText =
    diff >= 0
      ? `Ты ${youK}к — на ${diffK}к выше медианы`
      : `Ты ${youK}к — на ${diffK}к ниже медианы`

  return {
    bucketIndex: salaryBucketIndex(currentSalary, p25, p75),
    diff,
    diffText,
  }
}

export const FREE_QUOTA = 3
export const QUOTA_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Максимальный возраст записи о зарплате, которую ещё можно показывать.
 * Старше — считается неактуальной и не отдаётся (источник правды — живой HH).
 */
export const DATA_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

/** Remaining free uses in the current quota window. */
export const computeQuotaLeft = (usedInWindow: number, isPro: boolean): number => {
  if (isPro) return 999
  return Math.max(0, FREE_QUOTA - usedInWindow)
}

// ---- Widening helpers (injectable for testing) ----

export interface SalaryRow {
  median: number
  p25: number
  p75: number
  source: string
  city: string | null
  region: string | null
}

export type LookupFn = (
  roleKey: string,
  grades: string[],
  scope: string,
  location: { city?: string; region?: string },
) => Promise<SalaryRow | null>

export interface WideningResult {
  row: SalaryRow
  coverageLabel: string
}

const CITY_TO_REGION: Record<string, string> = {
  Москва: 'Московская область',
  'Санкт-Петербург': 'Ленинградская область',
  Новосибирск: 'Новосибирская область',
  Екатеринбург: 'Свердловская область',
  Казань: 'Республика Татарстан',
}

const normCityName = (city: string): string => {
  const aliases: Record<string, string> = {
    москва: 'Москва',
    moscow: 'Москва',
    'санкт-петербург': 'Санкт-Петербург',
    питер: 'Санкт-Петербург',
    спб: 'Санкт-Петербург',
    'st. petersburg': 'Санкт-Петербург',
    екатеринбург: 'Екатеринбург',
    новосибирск: 'Новосибирск',
    казань: 'Казань',
  }
  return aliases[city.toLowerCase().trim()] ?? city
}

/** Widen lookup: city → region → country, with optional grade widening. */
export const widenLookup = async (
  lookup: LookupFn,
  roleKey: string,
  grade: string | null,
  rawCity: string,
): Promise<WideningResult | null> => {
  const city = normCityName(rawCity)
  const grades = grade ? [grade, 'all'] : ['all']

  // 1. City scope
  const cityRow = await lookup(roleKey, grades, 'city', { city })
  if (cityRow) {
    return {
      row: cityRow,
      coverageLabel: `по ${cityRow.city ?? city} · ${cityRow.source}`,
    }
  }

  // 2. Region scope
  const region = CITY_TO_REGION[city]
  if (region) {
    const regionRow = await lookup(roleKey, grades, 'region', { region })
    if (regionRow) {
      return {
        row: regionRow,
        coverageLabel: `по ${regionRow.region ?? region} · ${regionRow.source}`,
      }
    }
  }

  // 3. Country scope
  const countryRow = await lookup(roleKey, grades, 'country', {})
  if (countryRow) {
    return {
      row: countryRow,
      coverageLabel: `по России · ${countryRow.source}`,
    }
  }

  // 4. Grade widening: retry without grade filter
  if (grade) {
    return widenLookup(lookup, roleKey, null, rawCity)
  }

  return null
}
