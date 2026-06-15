import { BaseInput } from '~/shared/ui/BaseInput'
import { Text } from '~/shared/ui/Text'

import type { NumberInputProps } from './types'

const formatter = new Intl.NumberFormat('ru-RU')

const format = (value: number | null) => (value === null ? '' : formatter.format(value))

export function NumberInput({
  value,
  onChange,
  label,
  optional,
  error,
  placeholder,
  disabled,
  suffix,
  max,
}: NumberInputProps) {
  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits === '') {
      onChange(null)
      return
    }
    let next = Number(digits)
    if (max !== undefined && next > max) {
      next = max
    }
    onChange(next)
  }

  return (
    <BaseInput
      inputMode='numeric'
      value={format(value)}
      onChange={(e) => handleChange(e.target.value)}
      label={label}
      optional={optional}
      error={error}
      placeholder={placeholder}
      disabled={disabled}
      post={
        suffix && (
          <Text variant='body' color='ink-soft'>
            {suffix}
          </Text>
        )
      }
    />
  )
}
