export type IntentAction = 'try' | 'pay'
export type IntentPlan = 'month' | 'year'

export interface IntentInput {
  /** Какая PRO-фича/экран спровоцировал намерение. */
  feature: string
  action: IntentAction
  plan?: IntentPlan
}

export interface IntentResult {
  ok: true
}
