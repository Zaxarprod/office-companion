import type { FastifyInstance } from 'fastify'

import { AppError } from '../lib/errors'

/** Единый формат ошибок: { error: { code, message } }. */
export const registerErrorHandler = (app: FastifyInstance) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      reply.code(error.status).send({ error: { code: error.code, message: error.message } })
      return
    }

    const statusCode = (error as { statusCode?: number }).statusCode ?? 500
    if (statusCode >= 500) {
      request.log.error({ err: error }, 'unhandled error')
      reply.code(statusCode).send({ error: { code: 'INTERNAL', message: 'Что-то пошло не так' } })
      return
    }

    const message = error instanceof Error ? error.message : 'Некорректный запрос'
    reply.code(statusCode).send({ error: { code: 'BAD_REQUEST', message } })
  })
}
