import type { ReactNode } from 'react'

import { SingleSelect } from '~/shared/ui'
import type { SelectOption, SingleSelectTriggerArgs } from '~/shared/ui'

const GRADES: SelectOption<string>[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
]

export interface GradeSelectProps {
  value: string | null
  onChange: (value: string) => void
  label?: string
  optional?: boolean
  error?: string
  renderTrigger?: (args: SingleSelectTriggerArgs<string>) => ReactNode
}

export const GradeSelect = ({
  value,
  onChange,
  label,
  optional,
  error,
  renderTrigger,
}: GradeSelectProps) => {
  const isPreset = GRADES.some((grade) => grade.value === value)

  return (
    <SingleSelect<string>
      options={GRADES}
      value={value}
      onChange={onChange}
      label={label}
      optional={optional}
      error={error}
      searchable={false}
      title='Должность / грейд'
      placeholder='Выбери грейд'
      other={{
        onOtherFieldChange: onChange,
        otherInitialValue: !isPreset && value ? value : '',
        placeholder: 'Свой грейд',
      }}
      renderTrigger={renderTrigger}
    />
  )
}
