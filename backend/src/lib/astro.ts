import * as Astronomy from 'astronomy-engine'

import type { AstroLevel, BirthInput } from '@contracts/common'
import type { ZodiacSign } from '@contracts/horoscope'

// Порядок знаков = индексам 0..11. Стихия = i%4, модальность = i%3, полярность = i%2
// (зодиак цикличен, поэтому свойства — это остатки от деления индекса).
const ZODIAC: ZodiacSign[] = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
]

export type Element = 'fire' | 'earth' | 'air' | 'water'
export type Modality = 'cardinal' | 'fixed' | 'mutable'
export type Polarity = 'yang' | 'yin'

export interface ZodiacMeta {
  label: string
  dates: string
  element: string
}

export const ZODIAC_META: Record<ZodiacSign, ZodiacMeta> = {
  aries: { label: 'Овен', dates: '21 мар — 19 апр', element: 'огонь' },
  taurus: { label: 'Телец', dates: '20 апр — 20 мая', element: 'земля' },
  gemini: { label: 'Близнецы', dates: '21 мая — 20 июн', element: 'воздух' },
  cancer: { label: 'Рак', dates: '21 июн — 22 июл', element: 'вода' },
  leo: { label: 'Лев', dates: '23 июл — 22 авг', element: 'огонь' },
  virgo: { label: 'Дева', dates: '23 авг — 22 сен', element: 'земля' },
  libra: { label: 'Весы', dates: '23 сен — 22 окт', element: 'воздух' },
  scorpio: { label: 'Скорпион', dates: '23 окт — 21 ноя', element: 'вода' },
  sagittarius: { label: 'Стрелец', dates: '22 ноя — 21 дек', element: 'огонь' },
  capricorn: { label: 'Козерог', dates: '22 дек — 19 янв', element: 'земля' },
  aquarius: { label: 'Водолей', dates: '20 янв — 18 фев', element: 'воздух' },
  pisces: { label: 'Рыбы', dates: '19 фев — 20 мар', element: 'вода' },
}

// Верхняя граница (месяц 0..11, день включительно) знака — для Солнца по календарю.
const BOUNDARIES: { until: [number, number]; sign: ZodiacSign }[] = [
  { until: [0, 19], sign: 'capricorn' },
  { until: [1, 18], sign: 'aquarius' },
  { until: [2, 20], sign: 'pisces' },
  { until: [3, 19], sign: 'aries' },
  { until: [4, 20], sign: 'taurus' },
  { until: [5, 20], sign: 'gemini' },
  { until: [6, 22], sign: 'cancer' },
  { until: [7, 22], sign: 'leo' },
  { until: [8, 22], sign: 'virgo' },
  { until: [9, 22], sign: 'libra' },
  { until: [10, 21], sign: 'scorpio' },
  { until: [11, 21], sign: 'sagittarius' },
]

const dateParts = (iso: string): [number, number, number] => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return [y ?? 2000, (m ?? 1) - 1, d ?? 1]
}

/** Знак Солнца по дате рождения (тропический, по календарю) — основа Уровня A. */
export const sunSignFromISO = (iso: string): ZodiacSign => {
  const [, month, day] = dateParts(iso)
  for (const { until, sign } of BOUNDARIES) {
    if (month < until[0] || (month === until[0] && day <= until[1])) {
      return sign
    }
  }
  return 'capricorn'
}

const signOfLon = (lon: number): ZodiacSign =>
  ZODIAC[Math.floor((((lon % 360) + 360) % 360) / 30)] ?? 'aries'

export const signIndex = (sign: ZodiacSign): number => ZODIAC.indexOf(sign)
export const elementOf = (sign: ZodiacSign): Element =>
  (['fire', 'earth', 'air', 'water'] as const)[signIndex(sign) % 4]!
export const modalityOf = (sign: ZodiacSign): Modality =>
  (['cardinal', 'fixed', 'mutable'] as const)[signIndex(sign) % 3]!
export const polarityOf = (sign: ZodiacSign): Polarity => (signIndex(sign) % 2 === 0 ? 'yang' : 'yin')

/** Расстояние между знаками в «шагах» 0..6 = классический аспект. */
export const aspectDistance = (a: ZodiacSign, b: ZodiacSign): number => {
  const d = Math.abs(signIndex(a) - signIndex(b)) % 12
  return Math.min(d, 12 - d)
}

// Базовая гармония 0..1 по расстоянию: тригон(4) > секстиль(2) > соединение(0) >
// оппозиция(6) > квинконс(5) ≈ полусекстиль(1) > квадрат(3).
const HARMONY: Record<number, number> = { 0: 0.62, 1: 0.4, 2: 0.78, 3: 0.34, 4: 0.9, 5: 0.42, 6: 0.66 }
export const aspectHarmony = (a: ZodiacSign, b: ZodiacSign): number =>
  HARMONY[aspectDistance(a, b)] ?? 0.5

// --- Эфемериды (Уровень B) -------------------------------------------------

const DEG = Math.PI / 180
const norm360 = (d: number): number => ((d % 360) + 360) % 360

// Часовой пояс: явный из города → грубо из долготы → дефолт СНГ (UTC+3).
const DEFAULT_TZ = 3
const resolveTz = (tz?: number, lon?: number): number =>
  tz ?? (lon == null ? DEFAULT_TZ : Math.round(lon / 15))

const birthInstant = (birthday: string, birthTime: string, tz: number): Date => {
  const [y, m, d] = dateParts(birthday)
  const [hh, mm] = birthTime.split(':').map(Number)
  return new Date(Date.UTC(y, m, d, (hh ?? 12) - tz, mm ?? 0))
}

const planetLon = (body: Astronomy.Body, date: Date): number =>
  Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon
const moonLon = (date: Date): number => Astronomy.EclipticGeoMoon(date).lon

// Наклон эклиптики (градусы).
const obliquity = (date: Date): number =>
  23.439291 - 0.0130042 * (Astronomy.MakeTime(date).tt / 36525)

/**
 * Асцендент (восходящий знак) — точка эклиптики на восточном горизонте.
 * Нужны и время (→ звёздное время через долготу), и широта. Формула проверена
 * по высоте/азимуту: результат лежит на горизонте с восточной стороны.
 */
const ascendantSign = (date: Date, lat: number, lon: number): ZodiacSign => {
  const ramc = norm360((Astronomy.SiderealTime(date) + lon / 15) * 15) * DEG
  const eps = obliquity(date) * DEG
  const phi = lat * DEG
  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)),
  )
  return signOfLon(norm360(asc / DEG))
}

export interface NatalChart {
  level: AstroLevel
  sun: ZodiacSign
  moon?: ZodiacSign
  mercury?: ZodiacSign
  venus?: ZodiacSign
  mars?: ZodiacSign
  ascendant?: ZodiacSign
}

/** Карта рождения: без времени — только Солнце (A), со временем — + планеты (B). */
export const buildChart = (birth: BirthInput): NatalChart => {
  const sun = sunSignFromISO(birth.birthday)
  if (!birth.birthTime) {
    return { level: 'sun', sun }
  }
  const tz = resolveTz(birth.tz, birth.lon)
  const at = birthInstant(birth.birthday, birth.birthTime, tz)
  const chart: NatalChart = {
    level: 'chart',
    sun,
    moon: signOfLon(moonLon(at)),
    mercury: signOfLon(planetLon(Astronomy.Body.Mercury, at)),
    venus: signOfLon(planetLon(Astronomy.Body.Venus, at)),
    mars: signOfLon(planetLon(Astronomy.Body.Mars, at)),
  }
  if (birth.lat != null && birth.lon != null) {
    chart.ascendant = ascendantSign(at, birth.lat, birth.lon)
  }
  return chart
}

const noonUTC = (dateISO?: string): Date => {
  if (!dateISO) {
    return new Date()
  }
  const [y, m, d] = dateParts(dateISO)
  return new Date(Date.UTC(y, m, d, 12, 0))
}

/** Ретроградный ли Меркурий в этот день (реальный сигнал неба). */
export const mercuryRetrograde = (dateISO?: string): boolean => {
  const date = noonUTC(dateISO)
  const e1 = planetLon(Astronomy.Body.Mercury, date)
  const e2 = planetLon(Astronomy.Body.Mercury, new Date(date.getTime() + 86_400_000))
  let delta = e2 - e1
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return delta < 0
}

/** Знак Луны в этот день — даёт естественную дневную динамику гороскопа. */
export const transitMoonSign = (dateISO?: string): ZodiacSign => signOfLon(moonLon(noonUTC(dateISO)))
