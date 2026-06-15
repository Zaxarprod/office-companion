import type { SalaryQuota, SalaryQuotaDto } from '../types'

export const mapQuota = (dto: SalaryQuotaDto): SalaryQuota => ({
  ...dto,
  resetAt: new Date(dto.resetAt),
})
