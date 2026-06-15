export type ChipValue = string | number

export interface ChipOption<T extends ChipValue> {
  value: T
  label: string
}

export interface ChipsProps<T extends ChipValue> {
  options: ChipOption<T>[]
  value: T
  onChange: (value: T) => void
}
