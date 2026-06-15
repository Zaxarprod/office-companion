import type { ReactNode } from 'react'

export interface SectionProps {
  title: string
  children?: ReactNode
  /** Зазор между заголовком и контентом, px. По умолчанию 11. */
  gap?: number
}
