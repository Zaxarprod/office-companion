import type { ReactNode } from 'react'

import type { IconName } from '~/shared/ui/Icon'

export type ButtonVariant = 'primary' | 'ghost' | 'light'
export type ButtonSize = 'md' | 'lg'

export interface ButtonProps {
  children?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  /** На всю ширину (как cta-lg). По умолчанию true. */
  fullWidth?: boolean
  iconLeft?: IconName
  iconRight?: IconName
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
}
