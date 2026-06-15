import type { ReactNode } from 'react'

export interface FieldProps {
  children?: ReactNode
  label?: string
  /** Пометка «необязательно» рядом с лейблом. */
  optional?: boolean
  error?: string
}
