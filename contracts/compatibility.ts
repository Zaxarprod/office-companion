import type { AstroLevel, BirthInput } from './common'
import type { ZodiacSign } from './horoscope'

export type Relation = 'boss' | 'colleague' | 'ex'

/**
 * Запрос совместимости. POST → тело JSON, поэтому можно вкладывать объекты.
 * `you` обычно заполняется из профиля, `target` — из формы. Уровень синастрии =
 * минимум из двух: кросс-аспекты (Луна-Луна и т.д.) считаются, только если время
 * есть у обоих; иначе — по знакам (Уровень A).
 */
export interface CompatibilityInput {
  you: BirthInput
  target: BirthInput
  relation: Relation
}

export interface CompatibilityDonutDto {
  label: string
  value: number
}

export interface CompatibilityDto {
  youSign: ZodiacSign
  targetSign: ZodiacSign
  percent: number
  verdict: string
  /** Положение маркера на шкале «катастрофа → идеал», 0..1. */
  scale: number
  description: string
  donuts: CompatibilityDonutDto[]
  /** Уровень расчёта: учли ли время рождения обоих. */
  level: AstroLevel
}
