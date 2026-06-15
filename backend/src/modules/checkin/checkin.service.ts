import type { SubmitCheckInInput } from '@contracts/checkin'

import { prisma } from '../../prisma'

const startOfToday = (): Date => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * «Порядок прохождения»: день = (число пройденных чек-инов % число дней) + 1.
 * Когда дни заканчиваются — начинаем заново с первого.
 */
const currentDay = async (userId: string): Promise<number> => {
  const [count, aggregate] = await Promise.all([
    prisma.checkIn.count({ where: { userId } }),
    prisma.question.aggregate({ _max: { day: true }, where: { active: true } }),
  ])
  const maxDay = aggregate._max.day ?? 1
  return (count % maxDay) + 1
}

const buildAdvice = (answers: SubmitCheckInInput['answers']): string => {
  const valueOf = (key: string) => answers.find((answer) => answer.questionKey === key)?.value
  const sleep = valueOf('sleep')
  const stress = valueOf('stress')
  if (sleep != null && sleep <= 2 && stress != null && stress >= 4) {
    return 'Сон ниже обычного, а напряжение высокое — забронируй себе паузу после обеда.'
  }
  return 'Ты заметил себя сегодня — это уже много. Завтра сверимся снова.'
}

export const checkinService = {
  getQuestions: async (userId: string) => {
    const day = await currentDay(userId)
    return prisma.question.findMany({
      where: { active: true, day },
      orderBy: { order: 'asc' },
    })
  },

  submit: async (userId: string, input: SubmitCheckInInput) => {
    const day = await currentDay(userId)
    return prisma.checkIn.create({
      data: {
        userId,
        day,
        advice: buildAdvice(input.answers),
        answers: {
          create: input.answers.map((answer) => ({
            questionKey: answer.questionKey,
            value: answer.value,
          })),
        },
      },
      include: { answers: true },
    })
  },

  getToday: (userId: string) =>
    prisma.checkIn.findFirst({
      where: { userId, createdAt: { gte: startOfToday() } },
      orderBy: { createdAt: 'desc' },
      include: { answers: true },
    }),
}
