import { Text } from '~/shared/ui/Text'

import type { CurrencyCode } from './currency'
import { useSystemCurrency } from './currency'
import type { MoneyTextProps } from './types'

const formatMoney = (amount: number, currency: CurrencyCode) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)

export function MoneyText({
  amount,
  currency,
  color = 'ink',
  variant = 'numeric',
}: MoneyTextProps) {
  const systemCurrency = useSystemCurrency()

  return (
    <Text variant={variant} color={color}>
      {formatMoney(amount, currency ?? systemCurrency)}
    </Text>
  )
}
