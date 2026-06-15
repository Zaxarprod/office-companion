import { Button, Card, Grid, HStack, IconBadge, Layout, Text, VStack } from '~/shared/ui'

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

export const CheckInDone = ({ checkIn, questions, onHome, onDynamics }: CheckInDoneProps) => {
  const byKey = new Map(questions.map((question) => [question.id, question]))
  const columns = Math.min(Math.max(checkIn.answers.length, 1), 5)

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
        <Grid columns={columns} gap={8}>
          {checkIn.answers.map((answer) => {
            const question = byKey.get(answer.questionKey)
            const max = question?.answers.length ?? 5
            return (
              <Card key={answer.questionKey} padding={10} radius='md'>
                <VStack gap={3} align='center'>
                  <HStack gap={1} align='baseline'>
                    <Text variant='subhead'>{answer.value}</Text>
                    <Text variant='small' color='ink-faint'>
                      /{max}
                    </Text>
                  </HStack>
                  <Text variant='small' color='ink-soft'>
                    {question?.helperText ?? answer.questionKey}
                  </Text>
                </VStack>
              </Card>
            )
          })}
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
