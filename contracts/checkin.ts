import type { ISODateString } from './common'

export interface CheckInAnswerOptionDto {
  value: number
}

/** Вопрос чек-ина из каталога (серверный). */
export interface QuestionDto {
  id: string
  order: number
  title: string
  helperText: string
  lowText: string
  highText: string
  image: string
  answers: CheckInAnswerOptionDto[]
  group: string
}

export interface CheckInAnswerInput {
  questionKey: string
  value: number
}

export interface SubmitCheckInInput {
  answers: CheckInAnswerInput[]
}

export interface DailyMetricsDto {
  sleep: number      // 0–100, higher = better
  burnout: number    // 0–100, higher = more risk
  stress: number     // 0–100, higher = more stressed
  engagement: number // 0–100, higher = better
  wellbeing: number  // 0–100, higher = better
}

export interface CheckInDto {
  id: string
  date: ISODateString
  answers: CheckInAnswerInput[]
  advice: string
  metrics: DailyMetricsDto
}

export type ReportPeriod = 'week' | 'month'

export interface CheckInPointDto {
  date: ISODateString
  score: number
}

export interface CheckInReportDto {
  period: ReportPeriod
  points: CheckInPointDto[]
  summary: string
}

export interface CheckInAccessDto {
  freeUntil?: ISODateString
  locked: boolean
}
