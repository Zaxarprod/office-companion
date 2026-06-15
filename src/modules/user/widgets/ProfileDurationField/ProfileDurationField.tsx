import { useEffect, useState } from 'react'

import { BottomSheet, Button, DurationInput, ListRow, VStack } from '~/shared/ui'
import type { DurationValue, IconBadgeTone, IconName } from '~/shared/ui'

export interface ProfileDurationFieldProps {
  icon: IconName
  iconTone?: IconBadgeTone
  label: string
  value: DurationValue
  placeholder?: string
  title: string
  onSubmit: (value: DurationValue) => void
}

const yearWord = (n: number) => {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) {
    return 'лет'
  }
  const mod10 = n % 10
  if (mod10 === 1) {
    return 'год'
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return 'года'
  }
  return 'лет'
}

const format = (value: DurationValue): string | undefined => {
  const parts: string[] = []
  if (value.years) {
    parts.push(`${value.years} ${yearWord(value.years)}`)
  }
  if (value.months) {
    parts.push(`${value.months} мес`)
  }
  return parts.length ? parts.join(' ') : undefined
}

export const ProfileDurationField = ({
  icon,
  iconTone,
  label,
  value,
  placeholder,
  title,
  onSubmit,
}: ProfileDurationFieldProps) => {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DurationValue>(value)

  useEffect(() => {
    if (open) {
      setDraft(value)
    }
  }, [open, value])

  const submit = () => {
    onSubmit(draft)
    setOpen(false)
  }

  return (
    <>
      <ListRow
        icon={icon}
        iconTone={iconTone}
        label={label}
        value={format(value)}
        placeholder={placeholder}
        onClick={() => setOpen(true)}
      />
      <BottomSheet.Root open={open} onClose={() => setOpen(false)}>
        <BottomSheet.Header title={title} closeButton />
        <BottomSheet.Body>
          <VStack gap={14}>
            <DurationInput value={draft} onChange={setDraft} />
            <Button onClick={submit}>Готово</Button>
          </VStack>
        </BottomSheet.Body>
      </BottomSheet.Root>
    </>
  )
}
