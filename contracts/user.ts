import type { ISODateString } from './common'

/** Профиль пользователя на проводе (даты — строки). */
export interface UserDto {
  id: string
  name: string
  avatarUrl?: string
  birthday?: ISODateString
  birthTime?: string
  country?: string
  city?: string
  /** Место рождения — для натальной карты (асцендент). */
  birthCity?: string
  profession?: string
  /** Канонический грейд (junior/…) или произвольный. */
  grade?: string
  experienceYears?: number
  experienceMonths?: number
  isPro: boolean
}

export interface UpdateUserInput {
  name?: string
  avatarUrl?: string
  birthday?: ISODateString
  birthTime?: string
  country?: string
  city?: string
  birthCity?: string
  profession?: string
  grade?: string
  experienceYears?: number
  experienceMonths?: number
}
