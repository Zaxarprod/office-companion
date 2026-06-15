import type { ColorToken, TypographyVariant } from '~/shared/styles/tokens'

import type { CurrencyCode } from './currency'

export interface MoneyTextProps {
  amount: number
  /** Если не передана — берётся из SystemCurrency (по умолчанию RUB). */
  currency?: CurrencyCode
  color?: ColorToken
  variant?: TypographyVariant
}
