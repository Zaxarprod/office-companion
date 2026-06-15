import type { CSSProperties, ReactNode } from 'react'

export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around'

export interface StackProps {
  children?: ReactNode
  /** Зазор между детьми, px */
  gap?: number
  align?: StackAlign
  justify?: StackJustify
  wrap?: boolean
  /** flex-grow контейнера */
  grow?: number
  inline?: boolean
}

export interface BaseStackProps extends StackProps {
  direction: CSSProperties['flexDirection']
}
