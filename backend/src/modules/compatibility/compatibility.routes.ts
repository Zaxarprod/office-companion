import type { FastifyInstance } from 'fastify'

import type { CompatibilityDto, CompatibilityInput } from '@contracts/compatibility'

import { AppError } from '../../lib/errors'

import { compatibilityService } from './compatibility.service'

export const compatibilityRoutes = async (app: FastifyInstance) => {
  app.post(
    '/compatibility',
    { preHandler: app.authenticate },
    async (request): Promise<CompatibilityDto> => {
      const input = request.body as CompatibilityInput
      if (!input?.you?.birthday || !input?.target?.birthday) {
        throw new AppError(400, 'BAD_INPUT', 'Нужны даты рождения обоих')
      }
      return compatibilityService.check(input)
    },
  )
}
