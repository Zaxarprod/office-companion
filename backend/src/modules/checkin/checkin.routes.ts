import type { FastifyInstance } from 'fastify'
import type {
  CheckInAccessDto,
  CheckInDto,
  CheckInReportDto,
  DailyMetricsDto,
  QuestionDto,
  SubmitCheckInInput,
} from '@contracts/checkin'
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
    const { checkIn, metrics } = await checkinService.submit(
      request.userId,
      request.body as SubmitCheckInInput,
    )
    return checkInToDto(checkIn, metrics)
  })

  app.get(
    '/check-in/today',
    { preHandler: app.authenticate },
    async (request): Promise<CheckInDto | null> => {
      const result = await checkinService.getToday(request.userId)
      if (!result) return null
      return checkInToDto(result.checkIn, result.metrics)
    },
  )

  app.get(
    '/metrics/daily',
    { preHandler: app.authenticate },
    async (request): Promise<DailyMetricsDto | null> => {
      return checkinService.getDailyMetrics(request.userId)
    },
  )

  app.get(
    '/check-in/access',
    { preHandler: app.authenticate },
    async (request): Promise<CheckInAccessDto> => {
      return checkinService.getAccess(request.userId)
    },
  )

  app.get(
    '/check-in/report',
    { preHandler: app.authenticate },
    async (request): Promise<CheckInReportDto> => {
      const { period } = request.query as { period?: string }
      return checkinService.getReport(request.userId, period === 'month' ? 'month' : 'week')
    },
  )
}
