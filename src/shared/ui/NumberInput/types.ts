import type { ReactNode } from 'react'

export interface NumberInputProps {
  value: number | null
  onChange: (value: number | null) => void
  label?: string
  optional?: boolean
  error?: string
  placeholder?: string
  disabled?: boolean
  /** Единица справа, например «₽». */
  suffix?: ReactNode
  /** Верхняя граница значения. */
  max?: number
}
