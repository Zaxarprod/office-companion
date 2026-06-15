import type { CheckIn, CheckInAnswer, Question } from '@prisma/client'

import type { CheckInDto, QuestionDto } from '@contracts/checkin'

export const questionToDto = (question: Question): QuestionDto => ({
  id: question.key,
  order: question.order,
  title: question.title,
  helperText: question.helperText,
  lowText: question.lowText,
  highText: question.highText,
  image: question.image,
  answers: Array.from({ length: question.scaleMax }, (_, index) => ({ value: index + 1 })),
})

export const checkInToDto = (checkIn: CheckIn & { answers: CheckInAnswer[] }): CheckInDto => ({
  id: checkIn.id,
  date: checkIn.createdAt.toISOString(),
  advice: checkIn.advice,
  answers: checkIn.answers.map((answer) => ({
    questionKey: answer.questionKey,
    value: answer.value,
  })),
})
