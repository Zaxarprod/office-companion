import cn from 'classnames'

import { Icon } from '~/shared/ui/Icon'

import type { IconButtonProps } from './types'

import styles from './IconButton.module.scss'

export function IconButton({
  icon,
  label,
  onClick,
  size = 38,
  variant = 'surface',
  shape = 'circle',
  color,
  disabled,
}: IconButtonProps) {
  return (
    <button
      type='button'
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(styles.button, styles[`variant-${variant}`], styles[`shape-${shape}`])}
      style={{ width: size, height: size }}
    >
      <Icon name={icon} size={Math.round(size * 0.47)} color={color} />
    </button>
  )
}
