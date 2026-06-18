import { createMutation, createQuery } from '~/shared/api'

import type {
  CheckIn,
  CheckInAccess,
  CheckInAccessDto,
  CheckInDto,
  CheckInQuestion,
  CheckInReport,
  CheckInReportDto,
  CheckInReportInput,
  DailyMetrics,
  DailyMetricsDto,
  SubmitCheckInInput,
} from '../types'

import { mapAccess, mapCheckIn, mapCheckInOrNull, mapReport } from './mappers'

import './mocks'

export const submitCheckIn = createMutation<SubmitCheckInInput, CheckInDto, CheckIn>({
  url: '/check-in',
  method: 'POST',
  transform: mapCheckIn,
})

export const getTodayCheckIn = createQuery<void, CheckInDto | null, CheckIn | null>({
  url: '/check-in/today',
  method: 'GET',
  transform: mapCheckInOrNull,
})

export const getCheckInReport = createQuery<CheckInReportInput, CheckInReportDto, CheckInReport>({
  url: '/check-in/report',
  method: 'GET',
  transform: mapReport,
})

export const getDailyMetrics = createQuery<void, DailyMetricsDto | null, DailyMetrics | null>({
  url: '/metrics/daily',
  method: 'GET',
  transform: (output) => output,
})

export const getCheckInAccess = createQuery<void, CheckInAccessDto, CheckInAccess>({
  url: '/check-in/access',
  method: 'GET',
  transform: mapAccess,
})

export const getCheckInQuestions = createQuery<void, CheckInQuestion[], CheckInQuestion[]>({
  url: '/check-in/questions',
  method: 'GET',
  transform: (output) => [...output].sort((a, b) => a.order - b.order),
})
