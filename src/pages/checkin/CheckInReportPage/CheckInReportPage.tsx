import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getCheckInReport } from '~/modules/checkIn/api/checkIn'
import {
  Button,
  Card,
  DistributionChart,
  HStack,
  IconBadge,
  Layout,
  ScreenLoader,
  Segment,
  Text,
  TopBar,
  VStack,
} from '~/shared/ui'
import type { ColorToken } from '~/shared/styles/tokens'
import type { DistributionBar, SegmentOption } from '~/shared/ui'

type Period = 'week' | 'month'

const PERIODS: SegmentOption<Period>[] = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
]

const scoreTone = (score: number): ColorToken =>
  score >= 65 ? 'sage' : score >= 40 ? 'ochre' : 'coral'

const dayLabel = (date: Date): string =>
  new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric' }).format(date)

export const CheckInReportPage = () => {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('week')
  const { data, isFetching } = getCheckInReport.useQuery({ period })

  const bars: DistributionBar[] = (data?.points ?? []).map((point) => ({
    value: point.score,
    tone: scoreTone(point.score),
    label: dayLabel(point.date),
  }))

  return (
    <Layout.Root standalone>
      <Layout.Header variant='bar'>
        <TopBar title='Моя динамика' onBack={() => navigate('/')} />
      </Layout.Header>

      <Layout.Body spacing={14}>
        <Segment options={PERIODS} value={period} onChange={setPeriod} />

        {isFetching ? (
          <ScreenLoader />
        ) : bars.length === 0 ? (
          <Card>
            <VStack gap={11} align='center'>
              <IconBadge icon='calendar-check' tone='sage' shape='circle' size={48} iconSize={24} />
              <Text variant='subhead' align='center'>
                Нет данных за период
              </Text>
              <Text variant='caption' color='ink-soft' align='center'>
                Пройди первый чек-ин — и здесь появится твоя динамика.
              </Text>
            </VStack>
          </Card>
        ) : (
          <>
            <Card>
              <VStack gap={14}>
                <HStack justify='between' align='center'>
                  <Text variant='label' color='ink-soft'>
                    Общий балл
                  </Text>
                  <Text variant='subhead' color='accent'>
                    {Math.round(
                      bars.reduce((s, b) => s + b.value, 0) / bars.length,
                    )}
                    /100
                  </Text>
                </HStack>
                <DistributionChart data={bars} height={80} />
              </VStack>
            </Card>

            {data?.summary && (
              <Card>
                <VStack gap={7}>
                  <Text variant='label' color='accent'>
                    Итог периода
                  </Text>
                  <Text variant='body'>{data.summary}</Text>
                </VStack>
              </Card>
            )}
          </>
        )}
      </Layout.Body>

      <Layout.Footer>
        <Button variant='ghost' iconLeft='home' onClick={() => navigate('/')}>
          На главную
        </Button>
      </Layout.Footer>
    </Layout.Root>
  )
}
