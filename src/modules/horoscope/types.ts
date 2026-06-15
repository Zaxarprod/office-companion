import type { HoroscopeAspectDto, HoroscopeDto } from '@contracts/horoscope'

export type AspectTone = 'sage' | 'ochre' | 'coral' | 'danger'

// GET → поля летят в query (плоско, строками). birthday — ISO 'YYYY-MM-DD'.
// Без birthTime → Уровень A (по знаку).
export interface HoroscopeInput {
  birthday: string
  birthTime?: string
  lat?: number
  lon?: number
  tz?: number
  date?: string
}

export interface HoroscopeAspect extends Omit<HoroscopeAspectDto, 'tone'> {
  tone: AspectTone
}

// Расклад на день (без дат в ответе → Output === MappedOutput, кроме сужения tone).
export interface Horoscope extends Omit<HoroscopeDto, 'aspects'> {
  aspects: HoroscopeAspect[]
}
