import type { HoroscopeAspectDto, HoroscopeDto } from '@contracts/horoscope'
import type { ZodiacSign } from '@contracts/horoscope'

import { ZODIAC_META, aspectHarmony, type NatalChart } from '../../lib/astro'

// Детерминированный 0..1 из строки (FNV-1a) — стабильный «случай» на день.
const hash01 = (input: string): number => {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % 100000) / 100000
}

type Tone = 'sage' | 'ochre' | 'coral' | 'danger'
const toneOf = (score: number): Tone =>
  score >= 0.66 ? 'sage' : score >= 0.46 ? 'ochre' : score >= 0.3 ? 'coral' : 'danger'

// Пул фраз: [label][tone] → варианты, выбор по сид-хэшу (наш tone of voice).
const PHRASES: Record<string, Record<Tone, string[]>> = {
  Созвоны: {
    sage: ['голос звучит уверенно — бери слово первым', 'на созвонах ты сегодня в ударе'],
    ochre: ['терпимо, если не затягивать', 'камеру можно и оставить — обойдётся'],
    coral: ['риск ↑ — камеру лучше выключить', 'говори меньше, кивай больше'],
    danger: ['день не для «а можно я скажу»', 'любой созвон — мимо, переноси'],
  },
  Дедлайны: {
    sage: ['успеваешь и даже с запасом', 'сроки сегодня на твоей стороне'],
    ochre: ['терпимо, если не брать новое', 'дотянешь, но без геройств'],
    coral: ['не обещай то, чего не успеешь', 'один дедлайн поедет — заложи буфер'],
    danger: ['ничего нового не бери — утонешь', 'сегодня всё горит, туши по одному'],
  },
  'Общий чат': {
    sage: ['можно и пошутить — зайдёт', 'в треде ты сегодня в авторитете'],
    ochre: ['пиши, но перечитывай перед отправкой', 'без острых тем — и норм'],
    coral: ['опасно — лучше промолчать', 'не время разносить чужой код'],
    danger: ['любое сообщение прилетит обратно', 'закрой чат, открой завтра'],
  },
  Фокус: {
    sage: ['голова ясная — бери сложное', 'втыкаешься в задачу с первого раза'],
    ochre: ['соберёшься, если убрать уведомления', 'фокус плавает, но рабочий'],
    coral: ['внимание рассыпается — дроби задачи', 'глубокую работу отложи на завтра'],
    danger: ['концентрации ноль — займись рутиной', 'день для мелочей, не для важного'],
  },
}

const LEADS: Record<Tone, string[]> = {
  sage: [
    'День в твою пользу: звёзды не мешают, а кое-где даже подыгрывают.',
    'Хороший расклад — можно браться за то, что откладывал.',
  ],
  ochre: [
    'День ровный: без подвигов, но и без катастроф.',
    'Космос нейтрален — вывезешь на спокойствии и списке дел.',
  ],
  coral: [
    'День просит держать лицо и не геройствовать с дедлайнами.',
    'Лучше тихо доделать своё, чем лезть в общие баталии.',
  ],
  danger: [
    'Сегодня небо явно не на стороне продуктивности — береги нервы.',
    'День из тех, что лучше пережить, чем покорить.',
  ],
}

const pick = <T>(items: T[], seed: number): T => items[Math.floor(seed * items.length) % items.length]!

export interface HoroscopeContext {
  chart: NatalChart
  dateISO: string
  transitMoon: ZodiacSign
  mercuryRetrograde: boolean
}

export const buildHoroscope = (ctx: HoroscopeContext): HoroscopeDto => {
  const { chart, dateISO, transitMoon, mercuryRetrograde } = ctx
  const sign = chart.sun
  const meta = ZODIAC_META[sign]

  // Настроение дня: гармония транзитной Луны с натальным Солнцем (B: + натальной Луной).
  const mood = chart.moon
    ? 0.6 * aspectHarmony(transitMoon, sign) + 0.4 * aspectHarmony(transitMoon, chart.moon)
    : aspectHarmony(transitMoon, sign)

  const scoreFor = (label: string, moodWeight: number, retroSensitive: boolean): number => {
    const base = hash01(`${sign}|${dateISO}|${label}`)
    let score = (1 - moodWeight) * base + moodWeight * mood
    if (retroSensitive && mercuryRetrograde) {
      score -= 0.22
    }
    return Math.max(0, Math.min(1, score))
  }

  const config: { label: string; moodWeight: number; retro: boolean }[] = [
    { label: 'Созвоны', moodWeight: 0.45, retro: true },
    { label: 'Дедлайны', moodWeight: 0.5, retro: false },
    { label: 'Общий чат', moodWeight: 0.4, retro: true },
    { label: 'Фокус', moodWeight: 0.55, retro: false },
  ]

  const aspects: HoroscopeAspectDto[] = config.map(({ label, moodWeight, retro }) => {
    const score = scoreFor(label, moodWeight, retro)
    const tone = toneOf(score)
    const variants = PHRASES[label]?.[tone] ?? ['день как день']
    return { label, tone, text: pick(variants, hash01(`${sign}|${dateISO}|${label}|text`)) }
  })

  const avg =
    config.reduce((sum, item) => sum + scoreFor(item.label, item.moodWeight, item.retro), 0) /
    config.length
  const leadTone = toneOf(avg)
  const leadBase = pick(LEADS[leadTone], hash01(`${sign}|${dateISO}|lead`))
  const lead = mercuryRetrograde
    ? `${leadBase} И да — Меркурий ретроградит, так что дважды проверяй отправленное.`
    : leadBase

  return {
    signLabel: meta.label,
    dates: meta.dates,
    element: meta.element,
    mercuryRetrograde,
    lead,
    aspects,
    level: chart.level,
    ascendant: chart.ascendant,
  }
}
