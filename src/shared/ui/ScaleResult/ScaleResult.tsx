import { colorVar } from '~/shared/styles/tokens'

import type { ScaleResultProps } from './types'

import styles from './ScaleResult.module.scss'

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export function ScaleResult({
  value,
  min = 0,
  max = 1,
  leftLabel,
  rightLabel,
  colors = ['danger', 'ochre', 'sage'],
}: ScaleResultProps) {
  const ratio = clamp01((value - min) / (max - min || 1))
  const gradient = `linear-gradient(90deg, ${colorVar(colors[0])} 0%, ${colorVar(colors[1])} 50%, ${colorVar(colors[2])} 100%)`

  return (
    <div className={styles.scale}>
      <div className={styles.track} style={{ background: gradient }}>
        <span className={styles.marker} style={{ left: `${ratio * 100}%` }} />
      </div>
      {(leftLabel || rightLabel) && (
        <div className={styles.labels}>
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  )
}
