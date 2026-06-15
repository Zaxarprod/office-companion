import { createMutation, createQuery } from '~/shared/api'

import type {
  CityComparison,
  SalaryFork,
  SalaryForkInput,
  SalaryQuota,
  SalaryQuotaDto,
} from '../types'

import { mapQuota } from './mappers'

import './mocks'

export const getSalaryFork = createMutation<SalaryForkInput, SalaryFork, SalaryFork>({
  url: '/salary/fork',
  method: 'POST',
  transform: (output) => output,
  mocked: true,
})

export const getSalaryCities = createMutation<SalaryForkInput, CityComparison[], CityComparison[]>({
  url: '/salary/cities',
  method: 'POST',
  transform: (output) => output,
  mocked: true,
})

export const getSalaryQuota = createQuery<void, SalaryQuotaDto, SalaryQuota>({
  url: '/salary/quota',
  method: 'GET',
  transform: mapQuota,
  mocked: true,
})
