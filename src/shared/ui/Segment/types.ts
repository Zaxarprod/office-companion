export type SegmentValue = string | number

export interface SegmentOption<T extends SegmentValue> {
  value: T
  label: string
}

export interface SegmentProps<T extends SegmentValue> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
}
