import { Field } from '~/shared/ui/Field'
import { NumberInput } from '~/shared/ui/NumberInput'
import { HStack, VStack } from '~/shared/ui/Stack'

export interface DurationValue {
  years: number | null
  months: number | null
}

export interface DurationInputProps {
  label?: string
  optional?: boolean
  value: DurationValue
  onChange: (value: DurationValue) => void
}

/** Два намбер-инпута: годы + месяцы (опыт работы и т.п.). */
export const DurationInput = ({ label, optional, value, onChange }: DurationInputProps) => (
  <Field label={label} optional={optional}>
    <HStack gap={9} align='start'>
      <VStack grow={1}>
        <NumberInput
          value={value.years}
          onChange={(years) => onChange({ ...value, years })}
          suffix='лет'
          placeholder='0'
          max={70}
        />
      </VStack>
      <VStack grow={1}>
        <NumberInput
          value={value.months}
          onChange={(months) => onChange({ ...value, months })}
          suffix='мес'
          placeholder='0'
          max={11}
        />
      </VStack>
    </HStack>
  </Field>
)
