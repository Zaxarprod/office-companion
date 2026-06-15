import cn from 'classnames'

import { Icon } from '~/shared/ui/Icon'

import type { ButtonProps } from './types'

import styles from './Button.module.scss'

export function Button({
  children,
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  iconLeft,
  iconRight,
  type = 'button',
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        styles.button,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        fullWidth && styles.fullWidth,
      )}
    >
      {iconLeft && <Icon name={iconLeft} size={16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={16} />}
    </button>
  )
}
