/** Замер намерения: клики по PRO/оплате (платежей пока нет). */
export interface TrackIntentInput {
  feature: string
  action: string
  plan?: string
}
