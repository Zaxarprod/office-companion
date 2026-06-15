import type { GridProps } from './types'

export const Grid = ({ children, columns = 2, gap = 12 }: GridProps) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap,
    }}
  >
    {children}
  </div>
)
