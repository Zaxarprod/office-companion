import type { FastifyInstance } from 'fastify'

import type { CheckInDto, QuestionDto, SubmitCheckInInput } from '@contracts/checkin'

import { checkInToDto, questionToDto } from './checkin.mapper'
import { checkinService } from './checkin.service'

export const checkinRoutes = async (app: FastifyInstance) => {
  app.get(
    '/check-in/questions',
    { preHandler: app.authenticate },
    async (request): Promise<QuestionDto[]> => {
      const questions = await checkinService.getQuestions(request.userId)
      return questions.map(questionToDto)
    },
  )

  app.post('/check-in', { preHandler: app.authenticate }, async (request): Promise<CheckInDto> => {
    const checkIn = await checkinService.submit(request.userId, request.body as SubmitCheckInInput)
    return checkInToDto(checkIn)
  })

  app.get(
    '/check-in/today',
    { preHandler: app.authenticate },
    async (request): Promise<CheckInDto | null> => {
      const checkIn = await checkinService.getToday(request.userId)
      return checkIn ? checkInToDto(checkIn) : null
    },
  )
}
