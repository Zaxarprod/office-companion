import type { ReactNode } from 'react'

import type { SingleSelectTriggerArgs } from '~/shared/ui'

export interface CitySingleSelectProps {
  /** Название выбранного города. */
  value: string | null
  onChange: (cityName: string) => void
  label?: string
  optional?: boolean
  error?: string
  placeholder?: string
  title?: string
  searchPlaceholder?: string
  /** Кастомный триггер (напр. строка профиля). */
  renderTrigger?: (args: SingleSelectTriggerArgs<string>) => ReactNode
}
