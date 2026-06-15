import { colorVar } from '~/shared/styles/tokens'

import type { DonutProps } from './types'

import styles from './Donut.module.scss'

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

const defaultFormat = (value: number) => `${Math.round(value * 100)}%`

export function Donut({
  value,
  color = 'accent',
  caption,
  size = 74,
  formatValue = defaultFormat,
}: DonutProps) {
  const ratio = clamp01(value)

  return (
    <div className={styles.donut}>
      <div className={styles.ring} style={{ width: size, height: size }}>
        <svg viewBox='0 0 36 36' className={styles.svg}>
          <circle
            cx='18'
            cy='18'
            r='15.5'
            fill='none'
            stroke='rgba(42,32,23,.10)'
            strokeWidth='3.6'
          />
          <circle
            cx='18'
            cy='18'
            r='15.5'
            fill='none'
            stroke={colorVar(color)}
            strokeWidth='3.6'
            pathLength={100}
            strokeDasharray={`${ratio * 100} 100`}
            strokeLinecap='round'
          />
        </svg>
        <span className={styles.value}>{formatValue(ratio)}</span>
      </div>
      {caption && <span className={styles.caption}>{caption}</span>}
    </div>
  )
}
