import type { ColorToken } from '~/shared/styles/tokens'
import type { IconName } from '~/shared/ui/Icon'

export type IconButtonVariant = 'surface' | 'ghost' | 'onAccent'
export type IconButtonShape = 'circle' | 'square'

export interface IconButtonProps {
  icon: IconName
  /** Доступная подпись (aria-label) — обязательна. */
  label: string
  onClick?: () => void
  /** Сторона кнопки, px. По умолчанию 38. */
  size?: number
  variant?: IconButtonVariant
  shape?: IconButtonShape
  color?: ColorToken
  disabled?: boolean
}
