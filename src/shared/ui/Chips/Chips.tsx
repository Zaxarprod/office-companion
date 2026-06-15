import cn from 'classnames'

import type { ChipsProps, ChipValue } from './types'

import styles from './Chips.module.scss'

export function Chips<T extends ChipValue>({ options, value, onChange }: ChipsProps<T>) {
  return (
    <div className={styles.chips}>
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          className={cn(styles.chip, value === option.value && styles.on)}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
