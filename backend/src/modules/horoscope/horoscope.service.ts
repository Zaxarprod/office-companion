import type { HoroscopeInput } from '@contracts/horoscope'

import { buildChart, mercuryRetrograde, transitMoonSign } from '../../lib/astro'

import { buildHoroscope } from './horoscope.logic'

export const horoscopeService = {
  get: (input: HoroscopeInput) => {
    const chart = buildChart(input)
    const dateISO = (input.date ?? new Date().toISOString()).slice(0, 10)
    return buildHoroscope({
      chart,
      dateISO,
      transitMoon: transitMoonSign(input.date),
      mercuryRetrograde: mercuryRetrograde(input.date),
    })
  },
}
