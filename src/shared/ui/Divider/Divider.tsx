import cn from 'classnames'

import type { DividerProps } from './types'

import styles from './Divider.module.scss'

export const Divider = ({ orientation = 'horizontal' }: DividerProps) => (
  <span
    className={cn(styles.divider, styles[orientation])}
    aria-hidden='true'
  />
)
