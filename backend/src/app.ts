import cors from '@fastify/cors'
import Fastify from 'fastify'

import { authRoutes } from './modules/auth/auth.routes'
import { checkinRoutes } from './modules/checkin/checkin.routes'
import { cityRoutes } from './modules/city/city.routes'
import { compatibilityRoutes } from './modules/compatibility/compatibility.routes'
import { horoscopeRoutes } from './modules/horoscope/horoscope.routes'
import { intentRoutes } from './modules/intent/intent.routes'
import { userRoutes } from './modules/user/user.routes'
import { registerAuth } from './plugins/auth'
import { registerErrorHandler } from './plugins/error-handler'

export const buildApp = async () => {
  const app = Fastify({ logger: true })

  await app.register(cors, { origin: true })
  await registerAuth(app)
  registerErrorHandler(app)

  app.get('/health', () => ({ ok: true }))

  await app.register(
    async (api) => {
      await api.register(authRoutes)
      await api.register(userRoutes)
      await api.register(checkinRoutes)
      await api.register(intentRoutes)
      await api.register(cityRoutes)
      await api.register(horoscopeRoutes)
      await api.register(compatibilityRoutes)
    },
    { prefix: '/api/v1' },
  )

  return app
}
