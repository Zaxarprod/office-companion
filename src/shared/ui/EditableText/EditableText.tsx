import { useEffect, useRef, useState } from 'react'

import { IconButton } from '~/shared/ui/IconButton'
import { HStack } from '~/shared/ui/Stack'
import { Text } from '~/shared/ui/Text'

import type { EditableTextProps } from './types'

import styles from './EditableText.module.scss'

export const EditableText = ({
  value,
  onSubmit,
  variant = 'heading',
  color = 'ink',
  buttonVariant = 'surface',
  editLabel = 'Изменить',
  confirmLabel = 'Сохранить',
}: EditableTextProps) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Вход в правку — берём актуальное значение и фокусируемся.
  useEffect(() => {
    if (editing) {
      setDraft(value)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [editing, value])

  const submit = () => {
    const next = draft.trim()
    if (next) {
      onSubmit(next)
    }
    setEditing(false)
  }

  if (!editing) {
    return (
      <HStack gap={8} inline>
        <Text variant={variant} color={color}>
          {value}
        </Text>
        <IconButton
          icon='pencil'
          label={editLabel}
          size={28}
          variant={buttonVariant}
          onClick={() => setEditing(true)}
        />
      </HStack>
    )
  }

  const onAccent = buttonVariant === 'onAccent'

  return (
    <HStack gap={8} inline>
      <input
        ref={inputRef}
        className={styles.input}
        data-variant={variant}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            submit()
          }
          if (event.key === 'Escape') {
            setEditing(false)
          }
        }}
        style={{
          color: `var(--${color})`,
          background: onAccent ? 'rgba(255, 255, 255, 0.18)' : 'rgba(42, 32, 23, 0.06)',
        }}
      />
      <IconButton
        icon='check'
        label={confirmLabel}
        size={28}
        variant={buttonVariant}
        onClick={submit}
      />
    </HStack>
  )
}
