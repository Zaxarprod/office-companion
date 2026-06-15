import type { CSSProperties } from 'react'

import type { BaseStackProps, StackAlign, StackJustify, StackProps } from './types'

const alignMap: Record<StackAlign, CSSProperties['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
}

const justifyMap: Record<StackJustify, CSSProperties['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
}

function Stack({
  children,
  direction,
  gap,
  align,
  justify,
  wrap,
  grow,
  inline,
}: BaseStackProps) {
  const style: CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: direction,
    gap,
    alignItems: align && alignMap[align],
    justifyContent: justify && justifyMap[justify],
    flexWrap: wrap ? 'wrap' : undefined,
    flexGrow: grow,
    minWidth: 0,
  }

  return <div style={style}>{children}</div>
}

export function HStack(props: StackProps) {
  return <Stack direction='row' {...props} align={props.align ?? 'center'} />
}

export function VStack(props: StackProps) {
  return <Stack direction='column' {...props} />
}
