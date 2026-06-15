import type { ColorToken } from '~/shared/styles/tokens'

import type { IconName } from './registry'

export interface IconProps {
  name: IconName
  /** Сторона иконки, px */
  size?: number
  /** Токен цвета; по умолчанию наследует currentColor */
  color?: ColorToken
  strokeWidth?: number
}
