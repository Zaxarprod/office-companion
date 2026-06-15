import { createMutation } from '~/shared/api'

import type { IntentInput, IntentResult } from '../types'

import './mocks'

export const trackIntent = createMutation<IntentInput, IntentResult, IntentResult>({
  url: '/intent',
  method: 'POST',
  transform: (output) => output,
})
