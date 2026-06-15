import { registerMock } from '~/shared/api'

import type { City } from '../types'

const cities: City[] = [
  { id: 'moscow', name: 'Москва', lat: 55.75, lon: 37.62, tz: 3 },
  { id: 'spb', name: 'Санкт-Петербург', lat: 59.94, lon: 30.31, tz: 3 },
  { id: 'nsk', name: 'Новосибирск', lat: 55.03, lon: 82.92, tz: 7 },
  // длинный хвост — проверяем виртуализацию SingleSelect
  ...Array.from({ length: 10_000 }, (_, i) => ({
    id: `city-${i}`,
    name: `Город ${i + 1}`,
  })),
]

registerMock<void, City[]>('GET', '/cities', () => cities)
