import type {
  CompatibilityDonutDto,
  CompatibilityDto,
  Relation,
} from '@contracts/compatibility'

import {
  aspectDistance,
  aspectHarmony,
  elementOf,
  modalityOf,
  polarityOf,
  type NatalChart,
} from '../../lib/astro'

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x))
const round2 = (x: number): number => Math.round(x * 100) / 100

/**
 * Проекция астро-осей на «офисные» метрики.
 *
 * Уровень A (по Солнцам) даёт базу из трёх свойств знака:
 *  - стихия (elementFit)   — как мыслите/реагируете;
 *  - модальность (tempoFit) — темп и инициатива;
 *  - аспект Солнц (harmony) — общий резонанс.
 *
 * Уровень B добавляет кросс-аспекты планет обоих (если у обоих есть время):
 *  - Луна-Луна   → эмоциональная сонастройка;
 *  - Меркурий-Меркурий → как договариваетесь словами;
 *  - Марс-Марс   → трение/драйв.
 */
const buildDonuts = (you: NatalChart, target: NatalChart, isChart: boolean): CompatibilityDonutDto[] => {
  const dist = aspectDistance(you.sun, target.sun)
  const harmony = aspectHarmony(you.sun, target.sun)

  const sameElement = elementOf(you.sun) === elementOf(target.sun)
  const compatibleElement = polarityOf(you.sun) === polarityOf(target.sun) // огонь-воздух / земля-вода
  const elementFit = sameElement ? 0.9 : compatibleElement ? 0.72 : 0.34

  const sameModality = modalityOf(you.sun) === modalityOf(target.sun)
  const tempoFit = dist === 0 ? 0.6 : sameModality ? 0.46 : 0.74

  const airOrFire = (s: NatalChart['sun']): boolean => {
    const e = elementOf(s)
    return e === 'air' || e === 'fire'
  }
  const talkative = (airOrFire(you.sun) ? 0.5 : 0) + (airOrFire(target.sun) ? 0.5 : 0) // 0/0.5/1
  const polarityFit = polarityOf(you.sun) === polarityOf(target.sun) ? 0.74 : 0.5

  // Жёсткость связки: квадрат/полусекстиль/квинконс бьют по терпимости.
  const harsh = dist === 3 ? 0.66 : dist === 1 || dist === 5 ? 0.5 : dist === 6 ? 0.32 : 0.12
  const tolerance = clamp01(0.45 * harmony + 0.55 * (1 - harsh))

  // База Уровня A
  let oneOnOne = 0.45 * harmony + 0.35 * polarityFit + 0.2 * (0.4 + 0.6 * talkative)
  let deadlines = 0.6 * tempoFit + 0.4 * harmony
  let language = 0.6 * elementFit + 0.4 * harmony
  let patience = tolerance

  // Уточнение Уровня B
  if (isChart && you.moon && target.moon && you.mercury && target.mercury && you.mars && target.mars) {
    const moonH = aspectHarmony(you.moon, target.moon)
    const mercH = aspectHarmony(you.mercury, target.mercury)
    const marsH = aspectHarmony(you.mars, target.mars)
    oneOnOne = 0.5 * oneOnOne + 0.5 * (0.5 * moonH + 0.5 * mercH)
    deadlines = 0.55 * deadlines + 0.45 * marsH
    language = 0.5 * language + 0.5 * mercH
    patience = 0.5 * patience + 0.5 * (0.5 * moonH + 0.5 * marsH)
  }

  return [
    { label: 'Созвоны 1:1', value: round2(clamp01(oneOnOne)) },
    { label: 'Дедлайны', value: round2(clamp01(deadlines)) },
    { label: 'Общий язык', value: round2(clamp01(language)) },
    { label: 'Терпимость', value: round2(clamp01(patience)) },
  ]
}

type Bucket = 'low' | 'mid' | 'ok' | 'high'
const bucketOf = (percent: number): Bucket =>
  percent >= 75 ? 'high' : percent >= 55 ? 'ok' : percent >= 38 ? 'mid' : 'low'

const VERDICTS: Record<Relation, Record<Bucket, string>> = {
  boss: {
    low: 'Выживаете на выносливости',
    mid: 'Держитесь на регламенте',
    ok: 'Рабочий тандем без драм',
    high: 'Понимаете с полуслова',
  },
  colleague: {
    low: 'Лучше в разных переговорках',
    mid: 'Сработаетесь, если не делить кухню',
    ok: 'Хорошая пара на проект',
    high: 'Спелись — хоть в один отдел',
  },
  ex: {
    low: 'Космос против вас двоих',
    mid: 'Дружить — только по работе',
    ok: 'Цивилизованно и без искр',
    high: 'Подозрительно гладко',
  },
}

const elementLine = (you: NatalChart, target: NatalChart): string => {
  const dist = aspectDistance(you.sun, target.sun)
  if (dist === 4) return 'Одна стихия — мыслите в такт и заводитесь от одного и того же.'
  if (dist === 2) return 'Стихии дополняют друг друга: один поджигает, другой раздувает.'
  if (dist === 6) return 'Вы — зеркала: тянет и бесит одновременно, классика «противоположности».'
  if (dist === 3) return 'Стихии конфликтуют — спорите не по делу, а по подходу.'
  if (dist === 0) return 'Один знак на двоих: слишком похожи, поэтому и спотыкаетесь об одно.'
  return 'Разный склад — придётся переводить друг друга на свой язык.'
}

const tempoLine = (you: NatalChart, target: NatalChart): string => {
  const sm = modalityOf(you.sun) === modalityOf(target.sun)
  if (!sm) return 'Темп разный, но это спасает: пока один разгоняет, другой доводит.'
  const m = modalityOf(you.sun)
  if (m === 'cardinal') return 'Оба рвётесь рулить — делите зоны ответственности заранее.'
  if (m === 'fixed') return 'Оба упёртые: договорённости держите, но переобуваться больно.'
  return 'Оба гибкие — идей гора, а финалить дедлайн придётся через силу.'
}

const chartLine = (you: NatalChart, target: NatalChart): string | null => {
  if (!you.moon || !target.moon || !you.mercury || !target.mercury) return null
  const moonH = aspectHarmony(you.moon, target.moon)
  const mercH = aspectHarmony(you.mercury, target.mercury)
  const moon = moonH >= 0.7 ? 'Луны в ладу — на нервах не сорвётесь' : moonH <= 0.42 ? 'Луны вразнобой — раздражение копится по мелочам' : 'Луны нейтральны — эмоции терпимы'
  const merc = mercH >= 0.7 ? 'а Меркурии говорят на одном языке' : mercH <= 0.42 ? 'а Меркурии тянут разговор в разные стороны' : 'а словами договариваетесь средне'
  return `Учли время рождения обоих: ${moon}, ${merc}.`
}

export const buildCompatibility = (
  you: NatalChart,
  target: NatalChart,
  relation: Relation,
): CompatibilityDto => {
  const isChart = you.level === 'chart' && target.level === 'chart'
  const donuts = buildDonuts(you, target, isChart)

  // Взвешенный процент: общий язык и терпимость весомее.
  const weights = [0.25, 0.2, 0.3, 0.25]
  const percent = Math.round(
    donuts.reduce((sum, donut, index) => sum + donut.value * (weights[index] ?? 0.25), 0) * 100,
  )
  const bucket = bucketOf(percent)

  const lines = [elementLine(you, target), tempoLine(you, target), chartLine(you, target)].filter(
    (line): line is string => Boolean(line),
  )

  return {
    youSign: you.sun,
    targetSign: target.sun,
    percent,
    verdict: VERDICTS[relation][bucket],
    scale: round2(percent / 100),
    description: lines.join(' '),
    donuts,
    level: isChart ? 'chart' : 'sun',
  }
}
