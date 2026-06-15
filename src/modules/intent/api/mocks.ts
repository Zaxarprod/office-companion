import { registerMock } from '~/shared/api'

import type { IntentInput, IntentResult } from '../types'

/** На этапе мока копим намерения в памяти — это основная метрика этапа. */
export const capturedIntents: IntentInput[] = []

registerMock<IntentInput, IntentResult>('POST', '/intent', (input) => {
  capturedIntents.push(input)
  return { ok: true }
})
