import type { IconName } from '~/shared/ui/Icon'
import type { IconBadgeTone } from '~/shared/ui/IconBadge'

export interface ListRowProps {
  icon: IconName
  /** Тинт иконки. */
  iconTone?: IconBadgeTone
  /** Подпись-ключ (мелкая, сверху). */
  label: string
  /** Значение. Если пусто — показываем placeholder бледным. */
  value?: string
  placeholder?: string
  /** Шеврон справа. По умолчанию true. */
  chevron?: boolean
  onClick?: () => void
}
