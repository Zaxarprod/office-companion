import { createMutation } from '~/shared/api'

import type { Compatibility, CompatibilityInput } from '../types'

import './mocks'

export const checkCompatibility = createMutation<
  CompatibilityInput,
  Compatibility,
  Compatibility
>({
  url: '/compatibility',
  method: 'POST',
  transform: (output) => output,
})
