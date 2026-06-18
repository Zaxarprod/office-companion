import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, HStack, IconButton, Layout, ScreenLoader, Text, VStack } from '~/shared/ui'

import {
  getCheckInQuestions,
  getDailyMetrics,
  getTodayCheckIn,
  submitCheckIn,
} from '../../api/checkIn'
import { CheckInDone } from '../../components/CheckInDone'
import { CheckInMascot } from '../../components/CheckInMascot'
import { CheckInProgress } from '../../components/CheckInProgress'
import { CheckInScale } from '../../components/CheckInScale'
import type { CheckIn, SubmitCheckInInput } from '../../types'

export const CheckInFlow = () => {
  const navigate = useNavigate()
  const { data: questions } = getCheckInQuestions.useQuery()
  const { mutate } = submitCheckIn.useMutation()
  const invalidateToday = getTodayCheckIn.useInvalidate()
  const invalidateMetrics = getDailyMetrics.useInvalidate()
  const invalidateQuestions = getCheckInQuestions.useInvalidate()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<CheckIn | null>(null)

  const goHome = () => navigate('/')
  const goDynamics = () => navigate('/checkin/report')

  if (result) {
    return <CheckInDone checkIn={result} onHome={goHome} onDynamics={goDynamics} />
  }

  if (!questions || questions.length === 0) {
    return <ScreenLoader />
  }

  const total = questions.length
  const question = questions[step]
  const current = answers[question.id] ?? null
  const isLast = step === total - 1

  const back = () => {
    if (step === 0) {
      goHome()
    } else {
      setStep((value) => value - 1)
    }
  }

  const next = () => {
    if (current == null) {
      return
    }
    if (!isLast) {
      setStep((value) => value + 1)
      return
    }
    const payload: SubmitCheckInInput = {
      answers: questions.map((item) => ({ questionKey: item.id, value: answers[item.id] ?? 0 })),
    }
    mutate(payload, {
      onSuccess: (checkIn) => {
        setResult(checkIn)
        invalidateToday()
        invalidateMetrics()
        invalidateQuestions()
      },
    })
  }

  const setAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
  }

  return (
    <Layout.Root standalone>
      <Layout.Header variant='bar'>
        <HStack gap={10} align='center'>
          <IconButton icon='chevron-left' label='Назад' onClick={back} />
          <CheckInProgress total={total} current={step} />
        </HStack>
      </Layout.Header>

      <Layout.Body spacing={16}>
        <CheckInMascot image={question.image} />
        <VStack gap={6}>
          <Text variant='label' color='ink-soft'>
            Вопрос {question.order} из {total} · {question.helperText}
          </Text>
          <Text variant='heading'>{question.title}</Text>
        </VStack>
        <CheckInScale
          options={question.answers}
          value={current}
          onChange={setAnswer}
          lowText={question.lowText}
          highText={question.highText}
        />
      </Layout.Body>

      <Layout.Footer>
        <HStack gap={10} align='stretch'>
          <IconButton icon='chevron-left' label='Назад' size={52} shape='square' onClick={back} />
          <VStack grow={1}>
            <Button iconRight='chevron-right' onClick={next} disabled={current == null}>
              {isLast ? 'Готово' : 'Дальше'}
            </Button>
          </VStack>
        </HStack>
      </Layout.Footer>
    </Layout.Root>
  )
}
