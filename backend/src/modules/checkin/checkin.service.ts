import type { DailyMetricsDto, SubmitCheckInInput } from '@contracts/checkin'
import type { CheckIn as PrismaCheckIn, CheckInAnswer, Question } from '@prisma/client'

// Lazy import — avoids crashing when imported in unit tests without a generated Prisma client.
const getDb = async () => {
  const { prisma } = await import('../../prisma')
  return prisma
}

const startOfToday = (): Date => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

const currentDay = async (userId: string): Promise<number> => {
  const prisma = await getDb()
  const [count, aggregate] = await Promise.all([
    prisma.checkIn.count({ where: { userId } }),
    prisma.question.aggregate({ _max: { day: true }, where: { active: true } }),
  ])
  const maxDay = aggregate._max.day ?? 1
  return (count % maxDay) + 1
}

// Pure function — testable without DB
export const computeMetrics = (
  answers: { questionKey: string; value: number }[],
  questions: Pick<Question, 'key' | 'group' | 'scaleMax'>[],
): DailyMetricsDto => {
  const byKey = new Map(questions.map((q) => [q.key, q]))

  const groupScores = (group: string): number[] =>
    answers
      .filter((a) => byKey.get(a.questionKey)?.group === group)
      .map((a) => {
        const q = byKey.get(a.questionKey)
        const max = q?.scaleMax ?? 5
        return (a.value / max) * 100
      })

  const avg = (scores: number[]): number =>
    scores.length === 0 ? 50 : Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)

  return {
    sleep: avg(groupScores('sleep')),
    burnout: avg(groupScores('burnout')),
    stress: avg(groupScores('stress')),
    engagement: avg(groupScores('engagement')),
    wellbeing: avg(groupScores('wellbeing')),
  }
}

// Pure function — testable
export const buildAdvice = (metrics: DailyMetricsDto): string => {
  if (metrics.burnout > 70 && metrics.sleep < 40) {
    return 'Выгорание нарастает, и сон не восстанавливает — попробуй лечь на час раньше. Остальное подождёт.'
  }
  if (metrics.burnout > 75) {
    return 'Высокий риск выгорания. Поставь себе в календарь «ничего» на сегодняшний вечер.'
  }
  if (metrics.stress > 75) {
    return 'Много напряжения — выдели 10 минут только для себя, без задач и экранов.'
  }
  if (metrics.sleep < 30) {
    return 'Сон был тяжёлым. Не планируй сложные решения сегодня — дай себе право работать медленнее.'
  }
  if (metrics.engagement > 70 && metrics.wellbeing > 70) {
    return 'Хороший день! Запомни, что помогло — эту энергию стоит повторить.'
  }
  if (metrics.engagement < 30) {
    return 'Мотивация невысокая — это нормально. Выбери одну задачу, которая приносит хоть немного удовлетворения.'
  }
  if (metrics.wellbeing < 30) {
    return 'Тяжёлый день. Самое важное сейчас — просто добраться до вечера. Всё остальное можно отложить.'
  }
  return 'Ты заметил себя сегодня — это уже много. Завтра сверимся снова.'
}

export const checkinService = {
  getQuestions: async (userId: string) => {
    const prisma = await getDb()
    const day = await currentDay(userId)
    return prisma.question.findMany({
      where: { active: true, day },
      orderBy: { order: 'asc' },
    })
  },

  submit: async (userId: string, input: SubmitCheckInInput) => {
    const prisma = await getDb()
    const day = await currentDay(userId)
    const questions = await prisma.question.findMany({
      where: { active: true },
      select: { key: true, group: true, scaleMax: true },
    })
    const metrics = computeMetrics(input.answers, questions)
    const advice = buildAdvice(metrics)
    const checkIn = await prisma.checkIn.create({
      data: {
        userId,
        day,
        advice,
        answers: {
          create: input.answers.map((answer) => ({
            questionKey: answer.questionKey,
            value: answer.value,
          })),
        },
      },
      include: { answers: true },
    })
    return { checkIn, metrics }
  },

  getToday: async (userId: string) => {
    const prisma = await getDb()
    const checkIn = await prisma.checkIn.findFirst({
      where: { userId, createdAt: { gte: startOfToday() } },
      orderBy: { createdAt: 'desc' },
      include: { answers: true },
    })
    if (!checkIn) return null
    const questions = await prisma.question.findMany({
      where: { active: true },
      select: { key: true, group: true, scaleMax: true },
    })
    const metrics = computeMetrics(checkIn.answers, questions)
    return { checkIn, metrics }
  },

  getDailyMetrics: async (userId: string): Promise<DailyMetricsDto | null> => {
    const prisma = await getDb()
    // Return today's check-in metrics, or yesterday's if no check-in today
    const since = startOfToday()
    let checkIn: (PrismaCheckIn & { answers: CheckInAnswer[] }) | null =
      await prisma.checkIn.findFirst({
        where: { userId, createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        include: { answers: true },
      })
    if (!checkIn) {
      const yesterday = new Date(since)
      yesterday.setDate(yesterday.getDate() - 1)
      checkIn = await prisma.checkIn.findFirst({
        where: { userId, createdAt: { gte: yesterday, lt: since } },
        orderBy: { createdAt: 'desc' },
        include: { answers: true },
      })
    }
    if (!checkIn) return null
    const questions = await prisma.question.findMany({
      where: { active: true },
      select: { key: true, group: true, scaleMax: true },
    })
    return computeMetrics(checkIn.answers, questions)
  },

  getAccess: async (_userId: string) => {
    // MVP: always free, no gating
    return { locked: false as const }
  },

  getReport: async (userId: string, period: 'week' | 'month') => {
    const prisma = await getDb()
    const days = period === 'week' ? 7 : 30
    const since = new Date()
    since.setDate(since.getDate() - days + 1)
    since.setHours(0, 0, 0, 0)

    const [checkIns, questions] = await Promise.all([
      prisma.checkIn.findMany({
        where: { userId, createdAt: { gte: since } },
        include: { answers: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.question.findMany({
        where: { active: true },
        select: { key: true, group: true, scaleMax: true },
      }),
    ])

    const points = checkIns.map((ci) => {
      const m = computeMetrics(ci.answers, questions)
      // Composite wellness score: (wellbeing + engagement + sleep - burnout - stress) normalised
      const raw = (m.wellbeing + m.engagement + m.sleep - m.burnout - m.stress + 200) / 5
      return {
        date: ci.createdAt.toISOString(),
        score: Math.max(0, Math.min(100, Math.round(raw))),
      }
    })

    const avgBurnout =
      points.length > 0
        ? checkIns.reduce((s, ci) => s + computeMetrics(ci.answers, questions).burnout, 0) /
          checkIns.length
        : 0

    const summary =
      points.length === 0
        ? 'Нет данных за период — пройди первый чек-ин.'
        : avgBurnout > 65
          ? 'Высокий уровень выгорания на этой неделе. Обрати внимание на восстановление.'
          : 'Неделя в норме. Следи за сном и уровнем стресса.'

    return { period, points, summary }
  },
}
