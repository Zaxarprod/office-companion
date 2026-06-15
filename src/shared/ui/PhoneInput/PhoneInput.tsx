import { FlagImage, usePhoneInput } from 'react-international-phone'

import { BaseInput } from '~/shared/ui/BaseInput'

import type { PhoneInputProps } from './types'

export function PhoneInput({
  value,
  onChange,
  label,
  optional,
  error,
  placeholder,
  disabled,
}: PhoneInputProps) {
  const { inputValue, country, handlePhoneValueChange, inputRef } = usePhoneInput({
    defaultCountry: 'ru',
    value,
    onChange: (data) => onChange(data.phone),
  })

  return (
    <BaseInput
      type='tel'
      value={inputValue}
      onChange={handlePhoneValueChange}
      inputRef={inputRef}
      label={label}
      optional={optional}
      error={error}
      placeholder={placeholder}
      disabled={disabled}
      pre={<FlagImage iso2={country.iso2} size={20} />}
    />
  )
}
