import { createQuery } from '~/shared/api'

import type { City } from '../types'

import './mocks'

export const getCities = createQuery<void, City[], City[]>({
  url: '/cities',
  method: 'GET',
  transform: (output) => output,
})
