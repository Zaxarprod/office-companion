import type { CSSProperties } from 'react'

import type { ShapesProps } from './types'

import styles from './Layout.module.scss'

/** Декоративные зелёные формы сверху — единственное место с absolute. */
export const Shapes = ({ variant, color = 'accent' }: ShapesProps) => (
  <div
    className={styles.shapes}
    data-variant={variant}
    style={{ '--shape-color': `var(--${color})` } as CSSProperties}
    aria-hidden='true'
  >
    <span className={styles.blobA} />
    <span className={styles.blobB} />
  </div>
)
