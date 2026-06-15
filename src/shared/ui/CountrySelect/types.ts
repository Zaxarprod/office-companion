import type { ReactNode } from 'react'

export interface Country {
  name: string
  flag: string
}

export interface CountrySelectTriggerArgs {
  selected: Country | null
  open: boolean
  onOpen: () => void
}

export interface CountrySelectProps {
  /** Название страны (совпадает с тем, что хранится у пользователя). */
  value: string | null
  onChange: (name: string) => void
  label?: string
  optional?: boolean
  error?: string
  placeholder?: string
  /** Кастомный триггер вместо инпут-поля (напр. строка профиля). */
  renderTrigger?: (args: CountrySelectTriggerArgs) => ReactNode
}
