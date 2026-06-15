import { Fragment } from 'react'

import { Card, Divider, HStack, IconBadge, Text, VStack } from '~/shared/ui'
import type { IconBadgeTone, IconName } from '~/shared/ui'

import { getDailyMetrics } from '../../api/checkIn'

const DASH = '—'
const pct = (value: number) => `${Math.round(value * 100)}%`

export const DailyMetrics = () => {
  const { data } = getDailyMetrics.useQuery()

  const items: { icon: IconName; tone: IconBadgeTone; value: string; label: string }[] = [
    { icon: 'moon', tone: 'moon', value: data ? `${data.sleepHours}ч` : DASH, label: 'Сон' },
    { icon: 'smile', tone: 'heart', value: data ? pct(data.condition) : DASH, label: 'Сост.' },
    { icon: 'flame', tone: 'coral', value: data ? pct(data.burnout) : DASH, label: 'Выгор.' },
    { icon: 'sofa', tone: 'ochre', value: data ? pct(data.rest) : DASH, label: 'Отдых' },
  ]

  return (
    <Card paddingX={6} paddingY={12} shadow='float'>
      <HStack>
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && <Divider orientation='vertical' />}
            <VStack grow={1} align='center' gap={5}>
              <IconBadge icon={item.icon} tone={item.tone} size={28} radius={9} iconSize={15} />
              <Text variant='subhead'>{item.value}</Text>
              <Text variant='micro' color='ink-soft'>
                {item.label}
              </Text>
            </VStack>
          </Fragment>
        ))}
      </HStack>
    </Card>
  )
}
