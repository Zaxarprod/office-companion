import type { ColorToken } from '~/shared/styles/tokens'

export interface DonutProps {
  /** Доля заполнения, 0..1. */
  value: number
  color?: ColorToken
  caption?: string
  /** Диаметр, px. По умолчанию 74. */
  size?: number
  /** Форматирование центрального значения. По умолчанию проценты. */
  formatValue?: (value: number) => string
}
