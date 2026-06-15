import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'KZT' | 'BYN'

export const DEFAULT_CURRENCY: CurrencyCode = 'RUB'

const SystemCurrencyContext = createContext<CurrencyCode>(DEFAULT_CURRENCY)

export function SystemCurrencyProvider({
  currency,
  children,
}: {
  currency: CurrencyCode
  children: ReactNode
}) {
  return (
    <SystemCurrencyContext.Provider value={currency}>{children}</SystemCurrencyContext.Provider>
  )
}

export const useSystemCurrency = () => useContext(SystemCurrencyContext)
