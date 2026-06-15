import type { ColorToken } from '~/shared/styles/tokens'

export interface ScaleResultProps {
  /** Значение результата. По умолчанию в диапазоне 0..1. */
  value: number
  min?: number
  max?: number
  leftLabel?: string
  rightLabel?: string
  /** Цвета градиента слева направо (токены). По умолчанию danger → ochre → sage. */
  colors?: [ColorToken, ColorToken, ColorToken]
}
