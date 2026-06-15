import cn from 'classnames'
import type { CSSProperties } from 'react'

import { Icon } from '~/shared/ui/Icon'

import type { IconBadgeProps } from './types'

import styles from './IconBadge.module.scss'

export const IconBadge = ({
  icon,
  char,
  tone = 'accent',
  size = 40,
  shape = 'square',
  radius = 12,
  iconSize,
}: IconBadgeProps) => {
  const toneStyle: CSSProperties =
    tone === 'onAccent'
      ? { background: 'rgba(255, 255, 255, 0.16)', color: 'var(--accent-fg)' }
      : { background: `var(--${tone}-bg)`, color: `var(--${tone})` }

  return (
    <span
      className={cn(styles.badge, styles[shape])}
      style={{ ...toneStyle, width: size, height: size, borderRadius: shape === 'square' ? radius : undefined }}
    >
      {char ? (
        <span style={{ fontSize: iconSize ?? Math.round(size * 0.55), lineHeight: 1 }}>{char}</span>
      ) : icon ? (
        <Icon name={icon} size={iconSize ?? Math.round(size * 0.5)} />
      ) : null}
    </span>
  )
}
