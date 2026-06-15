import type { ReactNode } from 'react'

import type { RadiusToken } from '~/shared/styles/tokens'

export type CardShadow = 'card' | 'float' | 'none'

export interface CardProps {
  children?: ReactNode
  /** Внутренний отступ, px. По умолчанию 14 (как плитки в макете). */
  padding?: number
  /** Горизонтальный отступ — переопределяет padding по оси X. */
  paddingX?: number
  /** Вертикальный отступ — переопределяет padding по оси Y. */
  paddingY?: number
  radius?: RadiusToken
  shadow?: CardShadow
  /** Тонкий бордер карточки. */
  bordered?: boolean
  /** Выделенное состояние — акцентный бордер + кольцо. */
  selected?: boolean
  onClick?: () => void
}
