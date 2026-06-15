import { Icon } from '~/shared/ui/Icon'
import { IconBadge } from '~/shared/ui/IconBadge'
import { VStack } from '~/shared/ui/Stack'
import { Text } from '~/shared/ui/Text'

import type { ListRowProps } from './types'

import styles from './ListRow.module.scss'

export const ListRow = ({
  icon,
  iconTone = 'accent',
  label,
  value,
  placeholder,
  chevron = true,
  onClick,
}: ListRowProps) => (
  <button type='button' className={styles.row} onClick={onClick}>
    <IconBadge icon={icon} tone={iconTone} size={34} radius={10} iconSize={17} />
    <VStack gap={1} grow={1}>
      <Text variant='small' color='ink-soft'>
        {label}
      </Text>
      {value ? (
        <Text variant='body' truncate>
          {value}
        </Text>
      ) : (
        <Text variant='body' color='ink-faint' truncate>
          {placeholder}
        </Text>
      )}
    </VStack>
    {chevron && <Icon name='chevron-right' size={16} color='ink-faint' />}
  </button>
)
