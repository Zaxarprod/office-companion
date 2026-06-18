export interface SalaryForkInput {
  country: string
  city: string
  profession: string
  grade: string
  experienceYears?: number
  experienceMonths?: number
  currentSalary?: number
}

export interface VacancyDto {
  id: string
  role: string
  company: string
  source: string
  salary: number
  /** Разница с текущей/медианой. */
  diff: number
}

export interface DistributionBucketDto {
  value: number
}

export interface SalaryForkDto {
  role: string
  median: number
  range: [number, number]
  distribution: DistributionBucketDto[]
  you?: {
    bucketIndex: number
    diff: number
    diffText: string
  }
  vacancies: VacancyDto[]
  /** Ярлык охвата и источника: «по Москве · Habr Career» */
  coverageLabel: string
}

export interface CityComparisonDto {
  city: string
  median: number
  diff: number
}

export interface SalaryQuotaDto {
  left: number
  total: number
  resetAt: string
}
