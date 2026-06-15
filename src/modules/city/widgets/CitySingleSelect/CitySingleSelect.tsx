import { useMemo } from 'react'

import { SingleSelect } from '~/shared/ui'
import type { SelectOption } from '~/shared/ui'

import { getCities } from '../../api/city'

import type { CitySingleSelectProps } from './types'

export function CitySingleSelect({
  value,
  onChange,
  label = 'Город',
  optional,
  error,
  placeholder,
  title = 'Выбери город',
  searchPlaceholder = 'Найти город',
  renderTrigger,
}: CitySingleSelectProps) {
  const { data } = getCities.useQuery()

  const options = useMemo<SelectOption<string>[]>(
    () => (data ?? []).map((city) => ({ value: city.name, label: city.name })),
    [data],
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
      title={title}
      searchPlaceholder={searchPlaceholder}
      renderTrigger={renderTrigger}
    />
  )
}
