import type { ReactNode } from 'react'

import { Button } from '~/shared/ui/Button'
import { Layout } from '~/shared/ui/Layout'
import { Text } from '~/shared/ui/Text'

import styles from './ErrorScreen.module.scss'

export interface ErrorScreenProps {
  title: string
  description?: string
  /** Любая иллюстрация над заголовком (иконка, маскот и т.п.). */
  image?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export const ErrorScreen = ({
  title,
  description,
  image,
  actionLabel,
  onAction,
}: ErrorScreenProps) => (
  <Layout.Root standalone>
    <div className={styles.screen}>
      {image}
      <Text variant='display' align='center'>
        {title}
      </Text>
      {description && (
        <Text variant='caption' color='ink-soft' align='center'>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <div className={styles.action}>
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  </Layout.Root>
)
