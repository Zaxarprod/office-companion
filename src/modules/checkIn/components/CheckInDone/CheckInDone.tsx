import { Button, Card, Grid, IconBadge, Layout, Text, VStack } from '~/shared/ui'
import type { IconBadgeTone, IconName } from '~/shared/ui'

import type { CheckInDoneProps } from './types'

const formatStamp = (date: Date) => {
  const day = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(date)
  const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date)
  return `${day} · ${time}`
}

const pct = (v: number) => `${Math.round(v)}%`

interface MetricCard {
  icon: IconName
  tone: IconBadgeTone
  label: string
  value: string
}

export const CheckInDone = ({ checkIn, onHome, onDynamics }: CheckInDoneProps) => {
  const m = checkIn.metrics
  const cards: MetricCard[] = [
    { icon: 'moon',        tone: 'moon',  label: 'Сон',           value: pct(m.sleep) },
    { icon: 'flame',       tone: 'coral', label: 'Выгорание',     value: pct(m.burnout) },
    { icon: 'zap',         tone: 'ochre', label: 'Стресс',        value: pct(m.stress) },
    { icon: 'sparkles',    tone: 'sage',  label: 'Вовлечённость', value: pct(m.engagement) },
    { icon: 'smile',       tone: 'heart', label: 'Самочувствие',  value: pct(m.wellbeing) },
  ]

  return (
    <Layout.Root standalone shapeVariant={4} shapeColor='mint'>
      <Layout.Header variant='bar' spacing={11}>
        <VStack gap={11} align='center'>
          <IconBadge icon='check' tone='sage' shape='circle' size={48} iconSize={24} />
          <Text variant='label' color='accent'>
            Чек-ин записан
          </Text>
          <Text variant='heading' align='center'>
            Ты заметил себя сегодня — это уже много.
          </Text>
          <Text variant='caption' color='ink-soft' align='center'>
            {formatStamp(checkIn.date)}
          </Text>
        </VStack>
      </Layout.Header>

      <Layout.Body spacing={14}>
        <Grid columns={5} gap={8}>
          {cards.map((card) => (
            <Card key={card.label} padding={10} radius='md'>
              <VStack gap={4} align='center'>
                <IconBadge icon={card.icon} tone={card.tone} size={24} radius={7} iconSize={12} />
                <Text variant='subhead'>{card.value}</Text>
                <Text variant='small' color='ink-soft'>
                  {card.label}
                </Text>
              </VStack>
            </Card>
          ))}
        </Grid>

        <Card>
          <VStack gap={7}>
            <Text variant='label' color='accent'>
              Полезный совет
            </Text>
            <Text variant='body'>{checkIn.advice}</Text>
          </VStack>
        </Card>
      </Layout.Body>

      <Layout.Footer>
        <Button iconLeft='trending-up' onClick={onDynamics}>
          Посмотреть динамику
        </Button>
        <Button variant='ghost' onClick={onHome}>
          На главную
        </Button>
      </Layout.Footer>
    </Layout.Root>
  )
}
