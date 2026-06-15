import { VStack } from '~/shared/ui/Stack'
import { Text } from '~/shared/ui/Text'

import type { SectionProps } from './types'

export const Section = ({ title, children, gap = 11 }: SectionProps) => (
  <VStack gap={gap}>
    <Text variant='subhead'>{title}</Text>
    {children}
  </VStack>
)
