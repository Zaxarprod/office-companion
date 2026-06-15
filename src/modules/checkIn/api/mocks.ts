import { registerMock } from '~/shared/api'

import type {
  CheckInAccessDto,
  CheckInAnswerOption,
  CheckInDto,
  CheckInQuestion,
  CheckInReportDto,
  CheckInReportInput,
  DailyMetrics,
  ScaleValue,
  SubmitCheckInInput,
} from '../types'

const advice = 'Сегодня многовато созвонов — забронируй себе 30 минут тишины после обеда.'

const buildScale = (max: number): CheckInAnswerOption[] =>
  Array.from({ length: max }, (_, index) => ({ value: (index + 1) as ScaleValue }))

// Дни прохождения (как на бэке): чек-ин циклически отдаёт день за днём.
const DAYS: CheckInQuestion[][] = [
  [
    { id: 'mood', order: 1, title: 'Какое настроение сегодня?', helperText: 'настроение', lowText: 'паршиво', highText: 'отлично', image: 'sloth_mood', answers: buildScale(5) },
    { id: 'energy', order: 2, title: 'Сколько в тебе сегодня сил?', helperText: 'энергия', lowText: 'вымотан', highText: 'в потоке', image: 'sloth_thinking', answers: buildScale(5) },
    { id: 'sleep', order: 3, title: 'Как тебе спалось?', helperText: 'сон', lowText: 'разбит', highText: 'выспался', image: 'sloth_sleep', answers: buildScale(5) },
    { id: 'stress', order: 4, title: 'Насколько сегодня напряжно?', helperText: 'стресс', lowText: 'спокойно', highText: 'на пределе', image: 'sloth_stress', answers: buildScale(5) },
    { id: 'support', order: 5, title: 'Есть на кого опереться?', helperText: 'опора', lowText: 'совсем один', highText: 'есть поддержка', image: 'sloth_support', answers: buildScale(5) },
  ],
  [
    { id: 'exhaustion', order: 1, title: 'Насколько ты выжат после дня?', helperText: 'истощение', lowText: 'полон сил', highText: 'пусто, на нуле', image: 'sloth_burnout', answers: buildScale(5) },
    { id: 'cynicism', order: 2, title: 'Хотелось делать на отвали?', helperText: 'дистанция', lowText: 'втянут', highText: 'всё равно', image: 'sloth_cynic', answers: buildScale(5) },
    { id: 'focus', order: 3, title: 'Получалось держать фокус?', helperText: 'фокус', lowText: 'туго, рассеян', highText: 'ясно, собран', image: 'sloth_focus', answers: buildScale(5) },
    { id: 'irritability', order: 4, title: 'Заводился из-за мелочей?', helperText: 'раздражимость', lowText: 'ровно', highText: 'на взводе', image: 'sloth_irrit', answers: buildScale(5) },
    { id: 'load', order: 5, title: 'Насколько ты сегодня загружен?', helperText: 'нагрузка', lowText: 'пусто', highText: 'завал', image: 'sloth_load', answers: buildScale(10) },
  ],
]

let submitCount = 0
let todayCheckIn: CheckInDto | null = null

registerMock<void, CheckInQuestion[]>(
  'GET',
  '/check-in/questions',
  () => DAYS[submitCount % DAYS.length],
)

registerMock<SubmitCheckInInput, CheckInDto>('POST', '/check-in', (input) => {
  submitCount += 1
  todayCheckIn = {
    id: `ci-${Date.now()}`,
    date: new Date().toISOString(),
    answers: input.answers,
    advice,
  }
  return todayCheckIn
})

registerMock<void, CheckInDto | null>('GET', '/check-in/today', () => todayCheckIn)

registerMock<CheckInReportInput, CheckInReportDto>('GET', '/check-in/report', (input) => {
  const days = input.period === 'week' ? 7 : 30
  const points = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return { date: date.toISOString(), score: 3 + Math.round(Math.sin(i) + 1) }
  })
  return {
    period: input.period,
    points,
    summary: 'Неделя ровная: настроение держится, но стресс к четвергу подрастает.',
  }
})

registerMock<void, DailyMetrics>('GET', '/metrics/daily', () => ({
  sleepHours: 6.5,
  condition: 0.85,
  burnout: 0.15,
  rest: 0.4,
}))

registerMock<void, CheckInAccessDto>('GET', '/check-in/access', () => ({
  freeUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  locked: false,
}))
