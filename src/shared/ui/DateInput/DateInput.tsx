import cn from 'classnames'
import { ru } from 'date-fns/locale/ru'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'

import { BottomSheet } from '~/shared/ui/BottomSheet'
import { Field } from '~/shared/ui/Field'

import type { DateInputProps } from './types'

import styles from './DateInput.module.scss'

import 'react-day-picker/style.css'

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const DASH = '—'

const startMonth = new Date(1940, 0)
const endMonth = new Date()

export function DateInput({
  value,
  onChange,
  label,
  optional,
  error,
  renderTrigger,
}: DateInputProps) {
  const [open, setOpen] = useState(false)

  const cells = [
    { k: 'день', v: value ? String(value.getDate()) : DASH },
    { k: 'месяц', v: value ? MONTHS_GENITIVE[value.getMonth()] : DASH },
    { k: 'год', v: value ? String(value.getFullYear()) : DASH },
  ]

  const handleSelect = (date: Date | undefined) => {
    onChange(date ?? null)
    if (date) {
      setOpen(false)
    }
  }

  const trigger = renderTrigger ? (
    renderTrigger({ value, open, onOpen: () => setOpen(true) })
  ) : (
    <Field label={label} optional={optional} error={error}>
      <button
        type='button'
        className={cn(styles.grid, open && styles.gridOpen)}
        onClick={() => setOpen(true)}
      >
        {cells.map((cell) => (
          <span key={cell.k} className={styles.cell}>
            <span className={value ? styles.value : styles.placeholder}>{cell.v}</span>
            <span className={styles.key}>{cell.k}</span>
          </span>
        ))}
      </button>
    </Field>
  )

  return (
    <>
      {trigger}
      <BottomSheet.Root open={open} onClose={() => setOpen(false)}>
        <BottomSheet.Header title='Выбери дату' closeButton />
        <BottomSheet.Body>
          <div className={styles.calendar}>
            <DayPicker
              mode='single'
              locale={ru}
              captionLayout='dropdown'
              startMonth={startMonth}
              endMonth={endMonth}
              defaultMonth={value ?? endMonth}
              selected={value ?? undefined}
              onSelect={handleSelect}
            />
          </div>
        </BottomSheet.Body>
      </BottomSheet.Root>
    </>
  )
}
