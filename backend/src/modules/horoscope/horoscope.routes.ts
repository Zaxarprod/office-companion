import type { FastifyInstance } from 'fastify'

import type { HoroscopeDto, HoroscopeInput } from '@contracts/horoscope'

import { AppError } from '../../lib/errors'

import { horoscopeService } from './horoscope.service'

export const horoscopeRoutes = async (app: FastifyInstance) => {
  // GET → параметры в query (плоско, строками); lat/lon приводим к числу.
  app.get('/horoscope', { preHandler: app.authenticate }, async (request): Promise<HoroscopeDto> => {
    const query = request.query as Record<string, string | undefined>
    if (!query.birthday) {
      throw new AppError(400, 'BAD_INPUT', 'Нужна дата рождения')
    }
    const input: HoroscopeInput = {
      birthday: query.birthday,
      birthTime: query.birthTime || undefined,
      lat: query.lat ? Number(query.lat) : undefined,
      lon: query.lon ? Number(query.lon) : undefined,
      date: query.date || undefined,
    }
    return horoscopeService.get(input)
  })
}
