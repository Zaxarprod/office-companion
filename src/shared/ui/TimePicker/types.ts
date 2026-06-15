import type { ReactNode } from 'react'

export interface TimeValue {
  hours: number
  minutes: number
}

export interface TimePickerTriggerArgs {
  value: TimeValue | null
  open: boolean
  onOpen: () => void
  /** Отформатированное время или null, если не задано. */
  formatted: string | null
}

export interface TimePickerProps {
  value: TimeValue | null
  onChange: (value: TimeValue) => void
  label?: string
  optional?: boolean
  error?: string
  placeholder?: string
  /** Заголовок листа. */
  title?: string
  /** Шаг минут. По умолчанию 5. */
  minuteStep?: number
  /** Формат часов. По умолчанию 24. */
  hourFormat?: 12 | 24
  /** Кастомный триггер вместо поля времени (напр. строка профиля). */
  renderTrigger?: (args: TimePickerTriggerArgs) => ReactNode
}
