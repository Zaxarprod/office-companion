import cn from 'classnames'

import { HStack, Text } from '~/shared/ui'

import type { CheckInProgressProps } from './types'

import styles from './CheckInProgress.module.scss'

export const CheckInProgress = ({ total, current }: CheckInProgressProps) => (
  <HStack gap={10} align='center' grow={1}>
    <HStack gap={5} grow={1}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            styles.dot,
            index < current && styles.done,
            index === current && styles.on,
          )}
        />
      ))}
    </HStack>
    <Text variant='label' color='ink-soft'>
      {current + 1}/{total}
    </Text>
  </HStack>
)
