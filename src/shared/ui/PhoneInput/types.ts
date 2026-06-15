export interface PhoneInputProps {
  /** Телефон в формате E.164 (например, +79991234567). */
  value: string
  onChange: (phone: string) => void
  label?: string
  optional?: boolean
  error?: string
  placeholder?: string
  disabled?: boolean
}
