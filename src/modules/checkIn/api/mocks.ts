import { registerMock } from '~/shared/api'

import type {
  CheckInAccessDto,
  CheckInAnswerOption,
  CheckInDto,
  CheckInQuestion,
  CheckInReportDto,
  CheckInReportInput,
  DailyMetricsDto,
  ScaleValue,
  SubmitCheckInInput,
} from '../types'

const advice = 'Сегодня многовато созвонов — забронируй себе 30 минут тишины после обеда.'

const buildScale = (max: number): CheckInAnswerOption[] =>
  Array.from({ length: max }, (_, index) => ({ value: (index + 1) as ScaleValue }))

// День 1 — 10 вопросов для mock-режима
const DAY1_QUESTIONS: CheckInQuestion[] = [
  { id: 'sleep_d1',        order: 1,  title: 'Как тебе спалось этой ночью?',                              helperText: 'сон',           lowText: 'ужасно', highText: 'отлично', image: 'sloth_sleep',    group: 'sleep',      answers: buildScale(10) },
  { id: 'burnout_d1_a',    order: 2,  title: 'К концу дня я чувствую себя опустошённым',                  helperText: 'истощение',     lowText: 'нет',    highText: 'да',      image: 'sloth_burnout',  group: 'burnout',    answers: buildScale(5) },
  { id: 'burnout_d1_b',    order: 3,  title: 'Мне сложно сосредоточиться на задачах',                     helperText: 'фокус',         lowText: 'нет',    highText: 'да',      image: 'sloth_burnout',  group: 'burnout',    answers: buildScale(5) },
  { id: 'burnout_d1_c',    order: 4,  title: 'Работа кажется мне бессмысленной',                          helperText: 'смысл',         lowText: 'нет',    highText: 'да',      image: 'sloth_burnout',  group: 'burnout',    answers: buildScale(5) },
  { id: 'stress_d1_a',     order: 5,  title: 'Сегодня я чувствовал(а), что не справляюсь с объёмом дел', helperText: 'перегрузка',    lowText: 'нет',    highText: 'да',      image: 'sloth_stress',   group: 'stress',     answers: buildScale(5) },
  { id: 'stress_d1_b',     order: 6,  title: 'Сегодня я был(а) раздражён(а) или на взводе',              helperText: 'раздражение',   lowText: 'нет',    highText: 'да',      image: 'sloth_stress',   group: 'stress',     answers: buildScale(5) },
  { id: 'engagement_d1_a', order: 7,  title: 'Сегодня я чувствовал(а) себя полным(ой) энергии на работе', helperText: 'энергия',      lowText: 'нет',    highText: 'да',      image: 'sloth_thinking', group: 'engagement', answers: buildScale(5) },
  { id: 'engagement_d1_b', order: 8,  title: 'Сегодня время на работе летело незаметно',                  helperText: 'поток',         lowText: 'нет',    highText: 'да',      image: 'sloth_thinking', group: 'engagement', answers: buildScale(5) },
  { id: 'wellbeing_d1_a',  order: 9,  title: 'Сегодня я чувствовал(а) себя в хорошем настроении',        helperText: 'настроение',    lowText: 'нет',    highText: 'да',      image: 'sloth_mood',     group: 'wellbeing',  answers: buildScale(5) },
  { id: 'wellbeing_d1_b',  order: 10, title: 'Сегодня я чувствовал(а) спокойствие и расслабленность',    helperText: 'спокойствие',   lowText: 'нет',    highText: 'да',      image: 'sloth_mood',     group: 'wellbeing',  answers: buildScale(5) },
]

let submitCount = 0
let todayCheckIn: CheckInDto | null = null

registerMock<void, CheckInQuestion[]>('GET', '/check-in/questions', () => DAY1_QUESTIONS)

registerMock<SubmitCheckInInput, CheckInDto>('POST', '/check-in', (input) => {
  submitCount += 1
  const fakeMetrics = { sleep: 70, burnout: 30, stress: 40, engagement: 65, wellbeing: 60 }
  todayCheckIn = {
    id: `ci-${Date.now()}`,
    date: new Date().toISOString(),
    answers: input.answers,
    advice,
    metrics: fakeMetrics,
  }
  return todayCheckIn
})

registerMock<void, CheckInDto | null>('GET', '/check-in/today', () => todayCheckIn)

registerMock<CheckInReportInput, CheckInReportDto>('GET', '/check-in/report', (input) => {
  const days = input.period === 'week' ? 7 : 30
  const points = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return { date: date.toISOString(), score: Math.round(50 + 25 * Math.sin(i * 0.9)) }
  })
  return {
    period: input.period,
    points,
    summary: 'Неделя ровная: настроение держится, но стресс к четвергу подрастает.',
  }
})

registerMock<void, DailyMetricsDto>('GET', '/metrics/daily', () => ({
  sleep: 70,
  burnout: 25,
  stress: 35,
  engagement: 68,
  wellbeing: 72,
}))

registerMock<void, CheckInAccessDto>('GET', '/check-in/access', () => ({
  freeUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  locked: false,
}))
