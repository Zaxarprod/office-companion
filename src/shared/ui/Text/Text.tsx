import type { CSSProperties } from 'react'

import { colorVar } from '~/shared/styles/tokens'

import type { TextProps } from './types'

import styles from './Text.module.scss'

export function Text({
  children,
  variant = 'body',
  color = 'ink',
  align,
  as: Tag = 'span',
  truncate,
}: TextProps) {
  const style: CSSProperties = {
    color: colorVar(color),
    textAlign: align,
  }

  return (
    <Tag
      className={truncate ? `${styles.text} ${styles.truncate}` : styles.text}
      data-variant={variant}
      style={style}
    >
      {children}
    </Tag>
  )
}
