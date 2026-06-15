import type { IconName } from '~/shared/ui/Icon'

export interface TextInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  optional?: boolean
  error?: string
  placeholder?: string
  disabled?: boolean
  /** Иконка справа (например, шеврон для select-подобного поля). */
  iconRight?: IconName
}
