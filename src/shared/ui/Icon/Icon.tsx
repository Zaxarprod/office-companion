import { colorVar } from '~/shared/styles/tokens'

import { iconRegistry } from './registry'
import type { IconProps } from './types'

export function Icon({ name, size = 20, color, strokeWidth = 2 }: IconProps) {
  const LucideIcon = iconRegistry[name]

  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      color={color ? colorVar(color) : undefined}
    />
  )
}
