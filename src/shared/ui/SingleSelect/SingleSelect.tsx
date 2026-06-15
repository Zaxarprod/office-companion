import { useVirtualizer } from '@tanstack/react-virtual'
import cn from 'classnames'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'

import { BaseInput } from '~/shared/ui/BaseInput'
import { BottomSheet } from '~/shared/ui/BottomSheet'
import { Field } from '~/shared/ui/Field'
import { Icon } from '~/shared/ui/Icon'
import { IconButton } from '~/shared/ui/IconButton'
import { SearchInput } from '~/shared/ui/SearchInput'

import type { SelectValue, SingleSelectProps } from './types'

import styles from './SingleSelect.module.scss'

const ROW_HEIGHT = 48

export function SingleSelect<T extends SelectValue>({
  value,
  onChange,
  options,
  label,
  optional,
  error,
  placeholder = 'Выбери',
  title = 'Выбор',
  searchable = true,
  searchPlaceholder = 'Поиск',
  other,
  renderTrigger,
}: SingleSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [customMode, setCustomMode] = useState(false)
  const [customDraft, setCustomDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [, forceRender] = useReducer((tick: number) => tick + 1, 0)

  const selected = options.find((option) => option.value === value) ?? null
  const isCustomValue = !!other && value != null && !selected
  const valueLabel = selected ? selected.label : value != null ? String(value) : null

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return options
    }
    return options.filter((option) => option.label.toLowerCase().includes(normalized))
  }, [options, query])

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  const openSyncRef = useRef({ filtered, value, virtualizer })
  openSyncRef.current = { filtered, value, virtualizer }

  useEffect(() => {
    if (!open) {
      return
    }
    forceRender()
    const sync = openSyncRef.current
    const selectedIndex = sync.filtered.findIndex((option) => option.value === sync.value)
    requestAnimationFrame(() => {
      if (selectedIndex >= 0) {
        sync.virtualizer.scrollToIndex(selectedIndex, { align: 'center' })
      } else {
        sync.virtualizer.scrollToOffset(0)
      }
    })
  }, [open])

  const reset = () => {
    setQuery('')
    setCustomMode(false)
    setCustomDraft('')
  }

  const handleSelect = (next: T) => {
    onChange(next)
    setOpen(false)
    reset()
  }

  const close = () => {
    setOpen(false)
    reset()
  }

  const enterCustom = () => {
    setCustomDraft(other?.otherInitialValue ?? '')
    setCustomMode(true)
  }

  const confirmCustom = () => {
    const next = customDraft.trim()
    if (next) {
      other?.onOtherFieldChange(next)
    }
    setOpen(false)
    reset()
  }

  const trigger = renderTrigger ? (
    renderTrigger({ selected, valueLabel, open, onOpen: () => setOpen(true) })
  ) : (
    <Field label={label} optional={optional} error={error}>
      <button
        type='button'
        className={cn(styles.trigger, open && styles.triggerOpen)}
        onClick={() => setOpen(true)}
      >
        <span className={valueLabel ? styles.value : styles.placeholder}>
          {valueLabel ?? placeholder}
        </span>
        <Icon name='chevron-down' size={16} color='ink-faint' />
      </button>
    </Field>
  )

  return (
    <>
      {trigger}
      <BottomSheet.Root open={open} onClose={close} detent='default' avoidKeyboard={false}>
        <BottomSheet.Header title={title} closeButton />
        {searchable && (
          <div className={styles.search}>
            <SearchInput value={query} onChange={setQuery} placeholder={searchPlaceholder} />
          </div>
        )}
        <BottomSheet.Body scrollRef={scrollRef} disableDrag>
          <div className={styles.list} style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((row) => {
              const option = filtered[row.index]
              const active = option.value === value
              return (
                <button
                  key={option.value}
                  type='button'
                  className={cn(styles.row, active && styles.rowActive)}
                  style={{ transform: `translateY(${row.start}px)`, height: row.size }}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className={styles.rowLabel}>{option.label}</span>
                  {active && <Icon name='check' size={18} color='accent' />}
                </button>
              )
            })}
          </div>

          {other && (
            <div className={styles.otherSticky}>
              {customMode ? (
                <BaseInput
                  autoFocus
                  value={customDraft}
                  onChange={(event) => setCustomDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      confirmCustom()
                    }
                  }}
                  placeholder={other.placeholder ?? 'Свой вариант'}
                  post={
                    <IconButton
                      icon='check'
                      label='Подтвердить'
                      size={30}
                      variant='ghost'
                      onClick={confirmCustom}
                    />
                  }
                />
              ) : (
                <button
                  type='button'
                  className={cn(styles.otherRow, isCustomValue && styles.otherRowActive)}
                  onClick={enterCustom}
                >
                  <Icon name='pencil' size={16} color='accent' />
                  <span className={styles.otherLabel}>
                    {isCustomValue ? valueLabel : (other.optionLabel ?? 'Другое')}
                  </span>
                  {isCustomValue && <Icon name='check' size={18} color='accent' />}
                </button>
              )}
            </div>
          )}
        </BottomSheet.Body>
      </BottomSheet.Root>
    </>
  )
}
