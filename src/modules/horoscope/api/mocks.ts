import { registerMock } from '~/shared/api'
import { ZODIAC_META, getAscendant, getZodiac } from '~/shared/lib/zodiac'

import type { Horoscope, HoroscopeInput } from '../types'

registerMock<HoroscopeInput, Horoscope>('GET', '/horoscope', (input) => {
  const sign = getZodiac(new Date(input.birthday))
  const meta = ZODIAC_META[sign]
  const level = input.birthTime ? 'chart' : 'sun'
  // Реальный асцендент (как на бэке), если есть время и координаты места.
  const [hh, mm] = (input.birthTime ?? '').split(':').map(Number)
  const ascendant =
    input.birthTime && input.lat != null && input.lon != null && input.tz != null
      ? getAscendant(new Date(input.birthday), hh || 0, mm || 0, input.lat, input.lon, input.tz)
      : undefined
  return {
    signLabel: meta.label,
    dates: meta.dates,
    element: meta.element,
    lead: 'День просит держать лицо на созвонах и не геройствовать с дедлайнами. Космос на твоей стороне, начальство — не очень.',
    aspects: [
      { label: 'Созвоны', tone: 'coral', text: 'риск ↑ — камеру можно и выключить' },
      { label: 'Дедлайны', tone: 'ochre', text: 'терпимо, если не брать новое' },
      { label: 'Общий чат', tone: 'danger', text: 'опасно — лучше промолчать' },
      { label: 'Фокус', tone: 'sage', text: 'голова ясная — бери сложное' },
    ],
    mercuryRetrograde: true,
    level,
    ascendant,
  }
})
