import type { ReactNode } from 'react'

export type ShapeVariant = 1 | 2 | 3 | 4

export type ShapeColor = 'accent' | 'sage' | 'gold' | 'coral' | 'mint'

export interface LayoutRootProps {
  children?: ReactNode
  /** Декоративные зелёные формы сверху (единственный absolute). */
  shapeVariant?: ShapeVariant
  /** Цвет shapes (для разных экранов, напр. успех чек-ина). */
  shapeColor?: ShapeColor
  /** Самостоятельная страница (вне TabsLayout): свой мобильный шелл-столбец. */
  standalone?: boolean
}

export interface LayoutFooterProps {
  children?: ReactNode
  spacing?: number
}

export type LayoutHeaderVariant = 'hero' | 'bar'

export interface LayoutHeaderProps {
  children?: ReactNode
  /** Зазор между блоками шапки, px. */
  spacing?: number
  /** hero — акцентный блок (по умолчанию); bar — плоский топбар. */
  variant?: LayoutHeaderVariant
}

export interface LayoutBodyProps {
  children?: ReactNode
  /** Зазор между блоками тела, px. */
  spacing?: number
}

export interface ShapesProps {
  variant: ShapeVariant
  color?: ShapeColor
}
