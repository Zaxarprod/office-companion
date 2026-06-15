import { useMemo } from 'react'

import { SingleSelect } from '~/shared/ui/SingleSelect'
import type { SelectOption } from '~/shared/ui/SingleSelect'

import { COUNTRIES } from './countries'
import type { CountrySelectProps } from './types'

export const CountrySelect = ({
  value,
  onChange,
  label = 'Страна',
  optional,
  error,
  placeholder = 'Выбери страну',
  renderTrigger,
}: CountrySelectProps) => {
  const options = useMemo<SelectOption<string>[]>(
    () =>
      COUNTRIES.map((country) => ({
        value: country.name,
        label: `${country.flag} ${country.name}`,
      })),
    [],
  )

  return (
    <SingleSelect<string>
      options={options}
      value={value}
      onChange={onChange}
      label={label}
      optional={optional}
      error={error}
      placeholder={placeholder}
      title='Страна'
      searchable={false}
      renderTrigger={
        renderTrigger &&
        (({ open, onOpen }) =>
          renderTrigger({
            selected: COUNTRIES.find((country) => country.name === value) ?? null,
            open,
            onOpen,
          }))
      }
    />
  )
}
