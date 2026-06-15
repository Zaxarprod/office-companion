import type { IconName } from '~/shared/ui/Icon'

export type IconBadgeTone =
  | 'accent'
  | 'gold'
  | 'ochre'
  | 'coral'
  | 'sage'
  | 'danger'
  | 'heart'
  | 'moon'
  | 'onAccent'

export interface IconBadgeProps {
  /** Иконка из реестра. Можно вместо неё передать `char`. */
  icon?: IconName
  /** Произвольный символ вместо иконки (напр. знак зодиака ♍). */
  char?: string
  tone?: IconBadgeTone
  /** Сторона, px. По умолчанию 40. */
  size?: number
  shape?: 'circle' | 'square'
  /** Радиус для square, px. По умолчанию 12. */
  radius?: number
  /** Размер иконки, px. По умолчанию ~size*0.5. */
  iconSize?: number
}
