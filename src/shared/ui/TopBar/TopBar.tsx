import { IconButton } from '~/shared/ui/IconButton'
import { HStack, VStack } from '~/shared/ui/Stack'
import { Text } from '~/shared/ui/Text'

import styles from './TopBar.module.scss'

export interface TopBarProps {
  title?: string
  onBack?: () => void
}

/** Шапка-навигация: кнопка назад + центрированный заголовок (для форм-флоу). */
export const TopBar = ({ title, onBack }: TopBarProps) => (
  <HStack align='center' gap={8}>
    {onBack ? (
      <IconButton icon='chevron-left' label='Назад' onClick={onBack} />
    ) : (
      <span className={styles.spacer} />
    )}
    <VStack grow={1} align='center'>
      {title && <Text variant='subhead'>{title}</Text>}
    </VStack>
    <span className={styles.spacer} />
  </HStack>
)
