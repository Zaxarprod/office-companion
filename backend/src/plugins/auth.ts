import fastifyJwt from '@fastify/jwt'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { config } from '../config'
import { AppError } from '../lib/errors'
import { authService } from '../modules/auth/auth.service'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    userId: string
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string }
    user: { sub: string }
  }
}

/** Регистрирует JWT и guard сессии (provider-agnostic). */
export const registerAuth = async (app: FastifyInstance) => {
  await app.register(fastifyJwt, { secret: config.jwtSecret })
  app.decorateRequest('userId', '')

  app.decorate('authenticate', async (request: FastifyRequest) => {
    try {
      await request.jwtVerify()
      request.userId = request.user.sub
    } catch {
      // Заглушка: в dev пускаем как фиксированного пользователя даже без токена.
      if (config.authDev) {
        request.userId = await authService.getDevUserId()
        return
      }
      throw new AppError(401, 'UNAUTHORIZED', 'Нужна авторизация')
    }
  })
}
