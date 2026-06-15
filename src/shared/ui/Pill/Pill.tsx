import cn from 'classnames'

import { Icon } from '~/shared/ui/Icon'

import type { PillProps } from './types'

import styles from './Pill.module.scss'

export function Pill({ children, tone = 'sage', iconLeft, iconRight }: PillProps) {
  return (
    <span className={cn(styles.pill, styles[`tone-${tone}`])}>
      {iconLeft && <Icon name={iconLeft} size={12} />}
      {children}
      {iconRight && <Icon name={iconRight} size={12} />}
    </span>
  )
}
