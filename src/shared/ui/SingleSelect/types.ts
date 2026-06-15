import type { ReactNode } from 'react'

export type SelectValue = string | number

export interface SelectOption<T extends SelectValue> {
  value: T
  label: string
}

export interface SingleSelectOther {
  /** Колбэк при подтверждении произвольного значения «Другое». */
  onOtherFieldChange: (value: string) => void
  /** Предзаполнение поля «Другое». */
  otherInitialValue?: string
  /** Лейбл опции. По умолчанию «Другое». */
  optionLabel?: string
  /** Плейсхолдер поля ввода. */
  placeholder?: string
}

export interface SingleSelectTriggerArgs<T extends SelectValue> {
  /** Выбранная опция или null (для произвольного значения — null). */
  selected: SelectOption<T> | null
  /** Готовый лейбл для показа: опция или произвольное значение. */
  valueLabel: string | null
  open: boolean
  onOpen: () => void
}

export interface SingleSelectProps<T extends SelectValue> {
  value: T | null
  onChange: (value: T) => void
  options: SelectOption<T>[]
  label?: string
  optional?: boolean
  error?: string
  placeholder?: string
  /** Заголовок листа выбора. */
  title?: string
  searchable?: boolean
  searchPlaceholder?: string
  /** Опция «Другое» с инлайн-вводом произвольного значения. */
  other?: SingleSelectOther
  /** Кастомный триггер вместо инпут-поля (напр. строка профиля). */
  renderTrigger?: (args: SingleSelectTriggerArgs<T>) => ReactNode
}
