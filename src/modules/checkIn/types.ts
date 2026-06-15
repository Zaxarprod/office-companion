import type {
  CheckInDto,
  CheckInPointDto,
  CheckInReportDto,
  DailyMetricsDto,
  ReportPeriod,
} from '@contracts/checkin'

// Wire-типы — из contracts (единый источник правды).
export type {
  QuestionDto as CheckInQuestion,
  CheckInAnswerOptionDto as CheckInAnswerOption,
  CheckInAnswerInput,
  SubmitCheckInInput,
  CheckInDto,
  CheckInAccessDto,
  CheckInReportDto,
  CheckInPointDto,
  DailyMetricsDto,
  ReportPeriod,
} from '@contracts/checkin'

/** Параметры отчёта (query-вход). */
export interface CheckInReportInput {
  period: ReportPeriod
}

/** Клиентский чек-ин: дата приведена к Date. */
export type CheckIn = Omit<CheckInDto, 'date'> & { date: Date }

/** Клиентские метрики Главной (без дат). */
export type DailyMetrics = DailyMetricsDto

/** Клиентский отчёт: даты точек приведены к Date. */
export interface CheckInPoint extends Omit<CheckInPointDto, 'date'> {
  date: Date
}
export interface CheckInReport extends Omit<CheckInReportDto, 'points'> {
  points: CheckInPoint[]
}

/** Клиентский доступ: freeUntil приведён к Date. */
export interface CheckInAccess {
  freeUntil?: Date
  locked: boolean
}

/** Значение шкалы — для построения опций в моках. */
export type ScaleValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
