import type { CheckIn, CheckInAnswer, Question } from '@prisma/client'
import type { CheckInDto, DailyMetricsDto, QuestionDto } from '@contracts/checkin'

export const questionToDto = (question: Question): QuestionDto => ({
  id: question.key,
  order: question.order,
  title: question.title,
  helperText: question.helperText,
  lowText: question.lowText,
  highText: question.highText,
  image: question.image,
  group: question.group ?? '',
  answers: Array.from({ length: question.scaleMax }, (_, index) => ({ value: index + 1 })),
})

export const checkInToDto = (
  checkIn: CheckIn & { answers: CheckInAnswer[] },
  metrics: DailyMetricsDto,
): CheckInDto => ({
  id: checkIn.id,
  date: checkIn.createdAt.toISOString(),
  advice: checkIn.advice,
  answers: checkIn.answers.map((answer) => ({
    questionKey: answer.questionKey,
    value: answer.value,
  })),
  metrics,
})
