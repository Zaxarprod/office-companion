import type { ReactNode } from 'react'

import styles from './Callout.module.scss'

export type CalloutTone = 'accent' | 'sage' | 'gold' | 'ochre' | 'coral' | 'danger'

export interface CalloutProps {
  tone?: CalloutTone
  children?: ReactNode
}

/** Тинтованная плашка-выноска (фон `--{tone}-bg`). */
export const Callout = ({ tone = 'accent', children }: CalloutProps) => (
  <div className={styles.callout} style={{ background: `var(--${tone}-bg)` }}>
    {children}
  </div>
)
