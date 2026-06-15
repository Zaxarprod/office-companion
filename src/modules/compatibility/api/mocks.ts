import { registerMock } from '~/shared/api'
import { getZodiac } from '~/shared/lib/zodiac'
import type { ZodiacSign } from '~/shared/lib/zodiac'

import type { Compatibility, CompatibilityInput, Relation } from '../types'

const ORDER: ZodiacSign[] = [
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
const distance = (a: ZodiacSign, b: ZodiacSign): number => {
  const d = Math.abs(ORDER.indexOf(a) - ORDER.indexOf(b)) % 12
  return Math.min(d, 12 - d)
}
const HARMONY: Record<number, number> = { 0: 0.62, 1: 0.4, 2: 0.78, 3: 0.34, 4: 0.9, 5: 0.42, 6: 0.66 }

const verdictByRelation: Record<Relation, string> = {
  boss: 'Держитесь на регламенте',
  colleague: 'Сработаетесь, если не делить кухню',
  ex: 'Лучше в разных переговорках',
}

registerMock<CompatibilityInput, Compatibility>('POST', '/compatibility', (input) => {
  const youSign = getZodiac(input.you.birthday)
  const targetSign = getZodiac(input.target.birthday)
  const harmony = HARMONY[distance(youSign, targetSign)] ?? 0.5
  const level = input.you.birthTime && input.target.birthTime ? 'chart' : 'sun'
  const bump = level === 'chart' ? 0.12 : 0
  const norm = (x: number): number => Math.round(Math.max(0, Math.min(1, x + bump)) * 100) / 100

  const donuts = [
    { label: 'Созвоны 1:1', value: norm(harmony * 0.8 + 0.1) },
    { label: 'Дедлайны', value: norm(0.55) },
    { label: 'Общий язык', value: norm(harmony) },
    { label: 'Терпимость', value: norm(harmony * 0.7 + 0.15) },
  ]
  const percent = Math.round((donuts.reduce((sum, d) => sum + d.value, 0) / donuts.length) * 100)

  return {
    youSign,
    targetSign,
    percent,
    verdict: verdictByRelation[input.relation],
    scale: percent / 100,
    description:
      'Вы тянете проект на честности и упрямстве, но разный темп решений будет искрить. Спасают чёткие договорённости и письменные итоги встреч.' +
      (level === 'chart' ? ' Учли время рождения обоих: Луны в целом в ладу.' : ''),
    donuts,
    level,
  }
})
