import type { AstroLevel, BirthInput, ISODateString } from './common'

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces'

/**
 * Запрос гороскопа. GET → поля летят в query, поэтому всё плоско и примитивами
 * (birthday — ISO-строка). Без birthTime → Уровень A (по знаку).
 */
export interface HoroscopeInput extends BirthInput {
  /** На какой день расклад; по умолчанию — сегодня. */
  date?: ISODateString
}

export interface HoroscopeAspectDto {
  label: string
  text: string
  /** Цветовой тон пилюли (danger/ochre/…). */
  tone: string
}

export interface HoroscopeDto {
  signLabel: string
  dates: string
  element: string
  mercuryRetrograde: boolean
  lead: string
  aspects: HoroscopeAspectDto[]
  /** Уровень расчёта: учли ли время рождения. */
  level: AstroLevel
  /** Восходящий знак — есть, если заданы время и место рождения (Уровень B). */
  ascendant?: ZodiacSign
}
