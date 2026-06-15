import type { ReactNode } from 'react'

export interface DateInputTriggerArgs {
  value: Date | null
  open: boolean
  onOpen: () => void
}

export interface DateInputProps {
  value: Date | null
  onChange: (date: Date | null) => void
  label?: string
  optional?: boolean
  error?: string
  /** Кастомный триггер вместо поля даты (напр. строка профиля). */
  renderTrigger?: (args: DateInputTriggerArgs) => ReactNode
}
