import { BaseInput } from '~/shared/ui/BaseInput'
import { Icon } from '~/shared/ui/Icon'

import type { TextInputProps } from './types'

export function TextInput({
  value,
  onChange,
  label,
  optional,
  error,
  placeholder,
  disabled,
  iconRight,
}: TextInputProps) {
  return (
    <BaseInput
      type='text'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={label}
      optional={optional}
      error={error}
      placeholder={placeholder}
      disabled={disabled}
      post={iconRight && <Icon name={iconRight} size={16} />}
    />
  )
}
