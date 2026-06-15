import type { ElementType, ReactNode } from 'react'

import type { ColorToken, TypographyVariant } from '~/shared/styles/tokens'

export type TextAlign = 'left' | 'center' | 'right'

export interface TextProps {
  children?: ReactNode
  variant?: TypographyVariant
  color?: ColorToken
  align?: TextAlign
  /** Семантический тег: span (по умолчанию), p, h1… */
  as?: ElementType
  truncate?: boolean
}
