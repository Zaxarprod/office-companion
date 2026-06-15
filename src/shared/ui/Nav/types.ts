import type { IconName } from '~/shared/ui/Icon'

export type NavValue = string | number

export interface NavItem<T extends NavValue> {
  value: T
  label: string
  icon: IconName
}

export interface NavProps<T extends NavValue> {
  items: NavItem<T>[]
  value: T
  onChange: (value: T) => void
}
