import type { FastifyInstance } from 'fastify'

import type { TrackIntentInput } from '@contracts/intent'

import { prisma } from '../../prisma'

export const intentRoutes = async (app: FastifyInstance) => {
  app.post('/intent', { preHandler: app.authenticate }, async (request) => {
    const input = request.body as TrackIntentInput
    await prisma.intentEvent.create({
      data: {
        userId: request.userId,
        feature: input.feature,
        action: input.action,
        plan: input.plan,
      },
    })
    return { ok: true }
  })
}
