import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { SingleSelect } from '~/shared/ui'
import type { SelectOption, SingleSelectTriggerArgs } from '~/shared/ui'

const PROFESSIONS = [
  'Frontend-разработчик',
  'Backend-разработчик',
  'Fullstack-разработчик',
  'Мобильный разработчик',
  'QA-инженер',
  'DevOps-инженер',
  'Data Scientist',
  'Аналитик',
  'Дизайнер',
  'Продакт-менеджер',
  'Проджект-менеджер',
  'Маркетолог',
  'HR-специалист',
]

export interface ProfessionSelectProps {
  value: string | null
  onChange: (value: string) => void
  label?: string
  optional?: boolean
  error?: string
  renderTrigger?: (args: SingleSelectTriggerArgs<string>) => ReactNode
}

export const ProfessionSelect = ({
  value,
  onChange,
  label,
  optional,
  error,
  renderTrigger,
}: ProfessionSelectProps) => {
  const options = useMemo<SelectOption<string>[]>(
    () => PROFESSIONS.map((profession) => ({ value: profession, label: profession })),
    [],
  )
  const isPreset = value != null && PROFESSIONS.includes(value)

  return (
    <SingleSelect<string>
      options={options}
      value={value}
      onChange={onChange}
      label={label}
      optional={optional}
      error={error}
      title='Профессия'
      placeholder='Выбери профессию'
      searchPlaceholder='Найти профессию'
      other={{
        onOtherFieldChange: onChange,
        otherInitialValue: !isPreset && value ? value : '',
        placeholder: 'Своя профессия',
      }}
      renderTrigger={renderTrigger}
    />
  )
}
