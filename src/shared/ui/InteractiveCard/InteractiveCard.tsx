import { IconBadge } from '~/shared/ui/IconBadge'
import { Pill } from '~/shared/ui/Pill'
import { HStack, VStack } from '~/shared/ui/Stack'
import { Text } from '~/shared/ui/Text'

import type { InteractiveCardProps } from './types'

import styles from './InteractiveCard.module.scss'

export const InteractiveCard = ({
  icon,
  title,
  subtitle,
  tint = 'accent',
  extraLabel,
  onClick,
}: InteractiveCardProps) => (
  <button type='button' className={styles.card} onClick={onClick}>
    <VStack gap={12}>
      <HStack justify='between' align='start'>
        <IconBadge icon={icon} tone={tint} iconSize={20} />
        {!!extraLabel && <Pill tone='gold'>{extraLabel}</Pill>}
      </HStack>
      <Text variant='subhead'>{title}</Text>
    </VStack>
    {subtitle && (
      <Text variant='small' color='ink-soft'>
        {subtitle}
      </Text>
    )}
  </button>
)
