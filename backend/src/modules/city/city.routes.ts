import type { FastifyInstance } from 'fastify'

import type { CityDto } from '@contracts/city'

import { prisma } from '../../prisma'

export const cityRoutes = async (app: FastifyInstance) => {
  app.get('/cities', { preHandler: app.authenticate }, async (request): Promise<CityDto[]> => {
    const { query, limit } = request.query as { query?: string; limit?: string }
    const cities = await prisma.city.findMany({
      where: query ? { name: { contains: query, mode: 'insensitive' } } : undefined,
      take: Math.min(Number(limit ?? 50), 100),
      orderBy: { name: 'asc' },
    })
    return cities.map((city) => ({
      id: city.id,
      name: city.name,
      lat: city.lat ?? undefined,
      lon: city.lon ?? undefined,
      tz: city.tz ?? undefined,
    }))
  })
}
