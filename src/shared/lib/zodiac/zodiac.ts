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

export type ZodiacElement = 'огонь' | 'земля' | 'воздух' | 'вода'

export interface ZodiacMeta {
  label: string
  dates: string
  element: ZodiacElement
  /** Юникод-символ знака. */
  symbol: string
}

export const ZODIAC_META: Record<ZodiacSign, ZodiacMeta> = {
  aries: { label: 'Овен', dates: '21 мар — 19 апр', element: 'огонь', symbol: '♈︎' },
  taurus: { label: 'Телец', dates: '20 апр — 20 мая', element: 'земля', symbol: '♉︎' },
  gemini: { label: 'Близнецы', dates: '21 мая — 20 июн', element: 'воздух', symbol: '♊︎' },
  cancer: { label: 'Рак', dates: '21 июн — 22 июл', element: 'вода', symbol: '♋︎' },
  leo: { label: 'Лев', dates: '23 июл — 22 авг', element: 'огонь', symbol: '♌︎' },
  virgo: { label: 'Дева', dates: '23 авг — 22 сен', element: 'земля', symbol: '♍︎' },
  libra: { label: 'Весы', dates: '23 сен — 22 окт', element: 'воздух', symbol: '♎︎' },
  scorpio: { label: 'Скорпион', dates: '23 окт — 21 ноя', element: 'вода', symbol: '♏︎' },
  sagittarius: { label: 'Стрелец', dates: '22 ноя — 21 дек', element: 'огонь', symbol: '♐︎' },
  capricorn: { label: 'Козерог', dates: '22 дек — 19 янв', element: 'земля', symbol: '♑︎' },
  aquarius: { label: 'Водолей', dates: '20 янв — 18 фев', element: 'воздух', symbol: '♒︎' },
  pisces: { label: 'Рыбы', dates: '19 фев — 20 мар', element: 'вода', symbol: '♓︎' },
}

// Верхняя граница (месяц 0..11, день) каждого знака по возрастанию даты в году.
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

export function getZodiac(date: Date): ZodiacSign {
  const month = date.getMonth()
  const day = date.getDate()
  for (const { until, sign } of BOUNDARIES) {
    if (month < until[0] || (month === until[0] && day <= until[1])) {
      return sign
    }
  }
  // после 21 декабря — снова Козерог
  return 'capricorn'
}
