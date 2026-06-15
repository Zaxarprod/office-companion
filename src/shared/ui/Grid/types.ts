import type { ReactNode } from 'react'

export interface GridProps {
  children?: ReactNode
  /** Число равных колонок. По умолчанию 2. */
  columns?: number
  /** Зазор, px. По умолчанию 12. */
  gap?: number
}
