import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Card, HStack, IconBadge, Text, VStack } from '~/shared/ui'

import { getTodayCheckIn } from '../../api/checkIn'

const pad = (n: number) => String(n).padStart(2, '0')

export const CheckInPrompt = () => {
  const navigate = useNavigate()
  const { data } = getTodayCheckIn.useQuery()
  const [now, setNow] = useState(() => Date.now())

  const done = !!data

  // Тикаем раз в секунду только когда чек-ин уже пройден (показываем таймер).
  useEffect(() => {
    if (!done) {
      return
    }
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [done])

  if (!done) {
    return (
      <Button
        variant='light'
        size='md'
        iconLeft='calendar-check'
        onClick={() => navigate('/checkin')}
      >
        Пройти чек-ин
      </Button>
    )
  }

  const target = new Date(now)
  target.setHours(24, 0, 0, 0)
  const diff = Math.max(0, target.getTime() - now)
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  const countdown = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  return (
    <Card>
      <VStack gap={11}>
        <HStack gap={11} align='center'>
          <IconBadge icon='check' tone='sage' shape='circle' size={38} iconSize={20} />
          <VStack gap={1} grow={1}>
            <Text variant='subhead'>Чек-ин сегодня пройден</Text>
            <Text variant='small' color='ink-soft'>
              Ты заметил себя — это уже много.
            </Text>
          </VStack>
        </HStack>
        <HStack justify='between' align='center'>
          <Text variant='caption' color='ink-soft'>
            Следующий чек-ин через
          </Text>
          <Text variant='numeric' color='accent'>
            {countdown}
          </Text>
        </HStack>
      </VStack>
    </Card>
  )
}
