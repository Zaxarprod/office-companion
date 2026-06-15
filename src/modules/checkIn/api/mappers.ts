import type {
  CheckIn,
  CheckInAccess,
  CheckInAccessDto,
  CheckInDto,
  CheckInReport,
  CheckInReportDto,
} from '../types'

export const mapCheckIn = (dto: CheckInDto): CheckIn => ({
  ...dto,
  date: new Date(dto.date),
})

export const mapCheckInOrNull = (dto: CheckInDto | null): CheckIn | null =>
  dto ? mapCheckIn(dto) : null

export const mapReport = (dto: CheckInReportDto): CheckInReport => ({
  ...dto,
  points: dto.points.map((point) => ({ ...point, date: new Date(point.date) })),
})

export const mapAccess = (dto: CheckInAccessDto): CheckInAccess => ({
  ...dto,
  freeUntil: dto.freeUntil ? new Date(dto.freeUntil) : undefined,
})
