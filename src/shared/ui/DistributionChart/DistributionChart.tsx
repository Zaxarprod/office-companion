import { colorVar } from '~/shared/styles/tokens'

import type { DistributionChartProps } from './types'

import styles from './DistributionChart.module.scss'

const NEUTRAL = 'rgba(42, 32, 23, 0.1)'

export function DistributionChart({ data, height = 60, gap = 3 }: DistributionChartProps) {
  const max = data.reduce((acc, bar) => Math.max(acc, bar.value), 0) || 1
  const hasLabels = data.some((bar) => bar.label)

  return (
    <div className={styles.chart}>
      <div className={styles.bars} style={{ height, gap }}>
        {data.map((bar, index) => (
          <span
            key={index}
            className={styles.bar}
            style={{
              height: `${(bar.value / max) * 100}%`,
              background: bar.tone ? colorVar(bar.tone) : NEUTRAL,
            }}
          >
            {bar.arrow && (
              <span
                className={styles.arrow}
                style={{ borderTopColor: bar.tone ? colorVar(bar.tone) : 'currentColor' }}
              />
            )}
          </span>
        ))}
      </div>
      {hasLabels && (
        <div className={styles.labels} style={{ gap }}>
          {data.map((bar, index) => (
            <span key={index} className={styles.label}>
              {bar.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
