export interface SalaryForkInput {
  country: string
  city: string
  profession: string
  /** Грейд: канонический (junior/…) или произвольный («Другое»). */
  grade: string
  experienceYears?: number
  experienceMonths?: number
  currentSalary?: number
}

export interface Vacancy {
  id: string
  role: string
  company: string
  source: string
  salary: number
  /** Разница с текущей зарплатой/медианой. */
  diff: number
  logoUrl?: string
}

export interface DistributionBucket {
  value: number
}

/** Результат «Сколько недоплачивают» (без дат → Output === MappedOutput). */
export interface SalaryFork {
  role: string
  median: number
  range: [number, number]
  distribution: DistributionBucket[]
  you?: {
    bucketIndex: number
    diff: number
    diffText: string
  }
  vacancies: Vacancy[]
}

// ——— POST /salary/cities (PRO) ———

export interface CityComparison {
  city: string
  median: number
  diff: number
}

// ——— GET /salary/quota ———

export interface SalaryQuotaDto {
  left: number
  total: number
  resetAt: string
}

export interface SalaryQuota {
  left: number
  total: number
  resetAt: Date
}
