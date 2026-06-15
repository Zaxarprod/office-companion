import cn from 'classnames'

import type { SegmentProps, SegmentValue } from './types'

import styles from './Segment.module.scss'

export function Segment<T extends SegmentValue>({
  options,
  value,
  onChange,
}: SegmentProps<T>) {
  return (
    <div className={styles.seg}>
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          className={cn(styles.button, value === option.value && styles.on)}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
