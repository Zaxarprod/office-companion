import { WheelPicker, WheelPickerWrapper } from '@ncdai/react-wheel-picker'
import { useEffect, useState } from 'react'

import { BottomSheet } from '~/shared/ui/BottomSheet'
import { Button } from '~/shared/ui/Button'
import { Field } from '~/shared/ui/Field'
import { Icon } from '~/shared/ui/Icon'

import type { TimePickerProps, TimeValue } from './types'

import styles from './TimePicker.module.scss'

import '@ncdai/react-wheel-picker/style.css'

const pad = (n: number) => String(n).padStart(2, '0')

const wheelClassNames = {
  optionItem: styles.optionItem,
  highlightWrapper: styles.highlightWrapper,
  highlightItem: styles.highlightItem,
}

const buildOptions = (count: number, step = 1) =>
  Array.from({ length: Math.ceil(count / step) }, (_, i) => {
    const n = i * step
    return { value: pad(n), label: pad(n) }
  })

const meridiemOptions = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
]

const formatTrigger = (time: TimeValue, hourFormat: 12 | 24) => {
  if (hourFormat === 12) {
    const h12 = time.hours % 12 || 12
    const meridiem = time.hours < 12 ? 'AM' : 'PM'
    return `${h12}:${pad(time.minutes)} ${meridiem}`
  }
  return `${pad(time.hours)}:${pad(time.minutes)}`
}

export function TimePicker({
  value,
  onChange,
  label,
  optional,
  error,
  placeholder = 'Выбери время',
  title = 'Время',
  minuteStep = 5,
  hourFormat = 24,
  renderTrigger,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  // Черновик: колёса меняют его, а onChange срабатывает только по «Готово».
  const [draft, setDraft] = useState<TimeValue>(value ?? { hours: 0, minutes: 0 })

  useEffect(() => {
    if (open) {
      setDraft(value ?? { hours: 0, minutes: 0 })
    }
  }, [open, value])

  const hourOptions =
    hourFormat === 24
      ? buildOptions(24)
      : Array.from({ length: 12 }, (_, i) => ({
          value: pad(i + 1),
          label: pad(i + 1),
        }))
  const minuteOptions = buildOptions(60, minuteStep)

  const h12 = draft.hours % 12 || 12
  const meridiem = draft.hours < 12 ? 'AM' : 'PM'

  const handleHourChange = (raw: string) => {
    if (hourFormat === 24) {
      setDraft((d) => ({ ...d, hours: Number(raw) }))
      return
    }
    setDraft((d) => {
      const isPm = d.hours >= 12
      return { ...d, hours: (isPm ? 12 : 0) + (Number(raw) % 12) }
    })
  }

  const handleMeridiemChange = (raw: string) => {
    setDraft((d) => ({ ...d, hours: (raw === 'PM' ? 12 : 0) + (d.hours % 12) }))
  }

  const confirm = () => {
    onChange(draft)
    setOpen(false)
  }

  const formatted = value ? formatTrigger(value, hourFormat) : null

  const trigger = renderTrigger ? (
    renderTrigger({ value, open, onOpen: () => setOpen(true), formatted })
  ) : (
    <Field label={label} optional={optional} error={error}>
      <button
        type='button'
        className={open ? `${styles.trigger} ${styles.triggerOpen}` : styles.trigger}
        onClick={() => setOpen(true)}
      >
        <span className={value ? styles.value : styles.placeholder}>
          {value ? formatted : placeholder}
        </span>
        <Icon name='clock' size={16} color='ink-faint' />
      </button>
    </Field>
  )

  return (
    <>
      {trigger}
      <BottomSheet.Root open={open} onClose={() => setOpen(false)}>
        <BottomSheet.Header title={title} closeButton />
        <BottomSheet.Body disableDrag>
          <WheelPickerWrapper className={styles.wheels}>
            <WheelPicker
              infinite
              options={hourOptions}
              value={hourFormat === 24 ? pad(draft.hours) : pad(h12)}
              onValueChange={handleHourChange}
              classNames={wheelClassNames}
              scrollSensitivity={3}
              dragSensitivity={2}
            />
            <span className={styles.colon}>:</span>
            <WheelPicker
              infinite
              options={minuteOptions}
              value={pad(draft.minutes)}
              onValueChange={(raw) => setDraft((d) => ({ ...d, minutes: Number(raw) }))}
              classNames={wheelClassNames}
              scrollSensitivity={3}
              dragSensitivity={2}
            />
            {hourFormat === 12 && (
              <WheelPicker
                options={meridiemOptions}
                value={meridiem}
                onValueChange={handleMeridiemChange}
                classNames={wheelClassNames}
                scrollSensitivity={3}
                dragSensitivity={2}
              />
            )}
          </WheelPickerWrapper>
          <Button onClick={confirm}>Готово</Button>
        </BottomSheet.Body>
      </BottomSheet.Root>
    </>
  )
}
