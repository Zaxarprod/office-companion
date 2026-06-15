import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { trackIntent } from '~/modules/intent'
import {
  Button,
  Card,
  Grid,
  HStack,
  IconBadge,
  IconButton,
  Layout,
  Pill,
  Text,
  VStack,
} from '~/shared/ui'

const PLANS = [
  { id: 'month', name: 'Месяц', price: '199', unit: '₽', note: 'в месяц' },
  { id: 'year', name: 'Год', price: '124', unit: '₽/мес', note: '1 490 ₽ сразу', save: '−38%' },
] as const

const FEATURES = [
  { title: 'Важный разговор', note: 'ИИ готовит разговор с боссом' },
  { title: 'Полный доступ к «Недоплачивают»', note: 'без лимита проверок' },
  { title: 'Недельные отчёты и автопоиск', note: 'состояние + рынок' },
  { title: 'Аналитика выгорания', note: 'тренды и прогноз' },
]

export const SubscriptionPage = () => {
  const navigate = useNavigate()
  const [plan, setPlan] = useState<string>('month')
  const [submitted, setSubmitted] = useState(false)
  const { mutate } = trackIntent.useMutation()

  const onTry = () => {
    mutate({ feature: 'premium', action: 'pay', plan: plan as 'month' | 'year' })
    setSubmitted(true)
  }

  return (
    <Layout.Root standalone>
      <Layout.Header spacing={11}>
        <HStack justify='end'>
          <IconButton
            icon='x'
            label='Закрыть'
            size={32}
            variant='onAccent'
            onClick={() => navigate(-1)}
          />
        </HStack>
        <VStack gap={11} align='center'>
          <IconBadge icon='crown' tone='onAccent' size={54} radius={16} iconSize={28} />
          <Text variant='display' color='accent-fg' align='center'>
            Держимся Premium
          </Text>
          <Text variant='caption' color='accent-fg' align='center'>
            Всё, что помогает держаться — без ограничений.
          </Text>
        </VStack>
      </Layout.Header>

      <Layout.Body spacing={18}>
        <Grid columns={2} gap={9}>
          {PLANS.map((item) => (
            <Card
              key={item.id}
              radius='md'
              shadow='none'
              bordered
              selected={plan === item.id}
              padding={13}
              onClick={() => setPlan(item.id)}
            >
              <VStack gap={4}>
                <HStack justify='between' align='center'>
                  <Text variant='subhead'>{item.name}</Text>
                  {'save' in item && <Pill tone='sage'>{item.save}</Pill>}
                </HStack>
                <HStack gap={4} align='baseline'>
                  <Text variant='heading'>{item.price}</Text>
                  <Text variant='small' color='ink-soft'>
                    {item.unit}
                  </Text>
                </HStack>
                <Text variant='small' color='ink-soft'>
                  {item.note}
                </Text>
              </VStack>
            </Card>
          ))}
        </Grid>

        <VStack gap={11}>
          <Text variant='label' color='ink-soft'>
            Что откроется
          </Text>
          <VStack gap={11}>
            {FEATURES.map((feature) => (
              <HStack key={feature.title} gap={11} align='start'>
                <IconBadge icon='check' tone='sage' shape='circle' size={22} iconSize={13} />
                <VStack gap={1}>
                  <Text variant='body'>{feature.title}</Text>
                  <Text variant='small' color='ink-soft'>
                    {feature.note}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </Layout.Body>

      <Layout.Footer>
        {submitted ? (
          <Text variant='body' color='accent' align='center'>
            Скоро будет готово — ты первый узнаешь.
          </Text>
        ) : (
          <Button onClick={onTry}>Попробовать 7 дней бесплатно</Button>
        )}
        <Text variant='small' color='ink-faint' align='center'>
          Автопродление. Отменить можно в любой момент.
        </Text>
      </Layout.Footer>
    </Layout.Root>
  )
}
