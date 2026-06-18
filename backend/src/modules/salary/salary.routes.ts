import type { FastifyInstance } from 'fastify'

import type {
  CityComparisonDto,
  SalaryForkDto,
  SalaryForkInput,
  SalaryQuotaDto,
} from '@contracts/salary'

import { AppError } from '../../lib/errors'

import { salaryService } from './salary.service'

export const salaryRoutes = async (app: FastifyInstance) => {
  app.post(
    '/salary/fork',
    { preHandler: app.authenticate },
    async (request): Promise<SalaryForkDto> => {
      const input = request.body as SalaryForkInput
      if (!input?.profession || !input?.city || !input?.grade) {
        throw new AppError(400, 'BAD_INPUT', 'Нужны поля: profession, city, grade')
      }
      return salaryService.getFork(request.userId, input)
    },
  )

  app.post(
    '/salary/cities',
    { preHandler: app.authenticate },
    async (request): Promise<CityComparisonDto[]> => {
      const input = (request.body ?? {}) as SalaryForkInput
      return salaryService.getCities(request.userId, input)
    },
  )

  app.get(
    '/salary/quota',
    { preHandler: app.authenticate },
    async (request): Promise<SalaryQuotaDto> => {
      return salaryService.getQuota(request.userId)
    },
  )
}
