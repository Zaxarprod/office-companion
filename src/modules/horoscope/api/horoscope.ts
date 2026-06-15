import { createQuery } from '~/shared/api'
import type { HoroscopeDto } from '@contracts/horoscope'

import type { Horoscope, HoroscopeInput } from '../types'

import './mocks'

export const getHoroscope = createQuery<HoroscopeInput, HoroscopeDto, Horoscope>({
  url: '/horoscope',
  method: 'GET',
  // Бэк присылает валидные tone — сужаем string → AspectTone на клиенте.
  transform: (output) => output as Horoscope,
})
