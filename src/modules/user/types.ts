import type { UserDto } from '@contracts/user'

// Wire-тип («провод») — единый источник правды из contracts.
export type { UserDto } from '@contracts/user'

export type Grade = 'junior' | 'middle' | 'senior' | 'lead'

/** Клиентский тип: даты приведены к Date. */
export type User = Omit<UserDto, 'birthday'> & { birthday?: Date }

/** Клиентский ввод: даты — Date (на проводе сериализуются в ISO через JSON.stringify). */
export interface UpdateUserInput {
  name?: string
  avatarUrl?: string
  birthday?: Date
  birthTime?: string
  country?: string
  city?: string
  birthCity?: string
  profession?: string
  grade?: string
  experienceYears?: number
  experienceMonths?: number
}
