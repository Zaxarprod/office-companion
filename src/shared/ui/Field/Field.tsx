import type { FieldProps } from './types'

import styles from './Field.module.scss'

export function Field({ children, label, optional, error }: FieldProps) {
  return (
    <div className={styles.field}>
      {label && (
        <span className={styles.label}>
          {label}
          {optional && <span className={styles.opt}>необязательно</span>}
        </span>
      )}
      {children}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
