import type { FastifyInstance } from 'fastify'

import type { AuthSessionDto } from '@contracts/auth'

import { getStrategy } from '../../auth/strategies'
import { AppError } from '../../lib/errors'
import { toUserDto } from '../user/user.mapper'
import { authService } from './auth.service'

export const authRoutes = async (app: FastifyInstance) => {
  // POST /api/v1/auth/:provider — единственное место с провайдеро-спецификой.
  app.post('/auth/:provider', async (request): Promise<AuthSessionDto> => {
    const { provider } = request.params as { provider: string }

    const strategy = getStrategy(provider)
    if (!strategy) {
      throw new AppError(400, 'UNKNOWN_PROVIDER', `Провайдер «${provider}» не поддерживается`)
    }

    const identity = await strategy.verify(request.body)
    if (!identity) {
      throw new AppError(401, 'AUTH_FAILED', 'Не удалось авторизоваться')
    }

    const user = await authService.findOrCreate(provider, identity)
    const token = app.jwt.sign({ sub: user.id })
    return { token, user: toUserDto(user) }
  })
}
