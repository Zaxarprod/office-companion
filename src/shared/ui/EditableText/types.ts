import type { ColorToken, TypographyVariant } from '~/shared/styles/tokens'
import type { IconButtonVariant } from '~/shared/ui/IconButton'

export interface EditableTextProps {
  value: string
  /** Сабмит нового значения. Пустое — игнорируется (откат к последнему валидному). */
  onSubmit: (value: string) => void
  variant?: TypographyVariant
  color?: ColorToken
  /** Вариант кнопок-иконок (на акцентном фоне — onAccent). */
  buttonVariant?: IconButtonVariant
  editLabel?: string
  confirmLabel?: string
}
