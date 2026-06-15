import type { ZodiacSign } from './zodiac'

const DEG = Math.PI / 180
const norm360 = (d: number): number => ((d % 360) + 360) % 360

const SIGNS: ZodiacSign[] = [
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

const julianDay = (utc: Date): number => utc.getTime() / 86_400_000 + 2440587.5

// Greenwich Mean Sidereal Time (градусы).
const gmstDeg = (utc: Date): number => {
  const jd = julianDay(utc)
  const t = (jd - 2451545.0) / 36525
  return norm360(
    280.46061837 +
      360.98564736629 * (jd - 2451545.0) +
      0.000387933 * t * t -
      (t * t * t) / 38710000,
  )
}

const obliquity = (utc: Date): number => 23.439291 - 0.0130042 * ((julianDay(utc) - 2451545.0) / 36525)

/**
 * Асцендент (восходящий знак) по моменту UTC и координатам места.
 * Чистая тригонометрия + звёздное время — без эфемерид, поэтому считается на
 * клиенте мгновенно. Совпадает с серверным расчётом (astronomy-engine).
 */
export const ascendantFromUTC = (utc: Date, lat: number, lon: number): ZodiacSign => {
  const ramc = norm360(gmstDeg(utc) + lon) * DEG
  const eps = obliquity(utc) * DEG
  const phi = lat * DEG
  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)),
  )
  return SIGNS[Math.floor(norm360(asc / DEG) / 30)] ?? 'aries'
}

/** Асцендент по локальной дате+времени рождения и месту (с часовым поясом). */
export const getAscendant = (
  birthday: Date,
  hours: number,
  minutes: number,
  lat: number,
  lon: number,
  tz: number,
): ZodiacSign => {
  const utc = new Date(
    Date.UTC(birthday.getFullYear(), birthday.getMonth(), birthday.getDate(), hours - tz, minutes),
  )
  return ascendantFromUTC(utc, lat, lon)
}
