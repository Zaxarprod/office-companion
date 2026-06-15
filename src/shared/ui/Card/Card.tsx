import cn from 'classnames'

import type { CardProps } from './types'

import styles from './Card.module.scss'

export const Card = ({
  children,
  padding = 14,
  paddingX,
  paddingY,
  radius = 'lg',
  shadow = 'card',
  bordered,
  selected,
  onClick,
}: CardProps) => {
  const py = paddingY ?? padding
  const px = paddingX ?? padding

  return (
    <div
      onClick={onClick}
      className={cn(
        styles.card,
        styles[`radius-${radius}`],
        shadow !== 'none' && styles[`shadow-${shadow}`],
        bordered && styles.bordered,
        selected && styles.selected,
        onClick && styles.interactive,
      )}
      style={{ padding: `${py}px ${px}px` }}
    >
      {children}
    </div>
  )
}
