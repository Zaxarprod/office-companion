import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getMe, useProfileBackfill } from '~/modules/user'
import { ZODIAC_META, getZodiac } from '~/shared/lib/zodiac'
import type { ColorToken } from '~/shared/styles/tokens'
import {
  Button,
  DateInput,
  Donut,
  Field,
  HStack,
  IconBadge,
  Layout,
  MascotPlaceholder,
  ScaleResult,
  ScreenLoader,
  Segment,
  Text,
  TimePicker,
  TopBar,
  VStack,
} from '~/shared/ui'
import type { TimeValue } from '~/shared/ui'

import { checkCompatibility } from '../../api/compatibility'
import type { Relation } from '../../types'

const pad = (n: number) => String(n).padStart(2, '0')
const parseTime = (value?: string): TimeValue | null => {
  if (!value) {
    return null
  }
  const [hours, minutes] = value.split(':').map(Number)
  return { hours: hours || 0, minutes: minutes || 0 }
}
const formatTime = (time: TimeValue) => `${pad(time.hours)}:${pad(time.minutes)}`

const RELATIONS: { value: Relation; label: string }[] = [
  { value: 'boss', label: 'Босс' },
  { value: 'colleague', label: 'Коллега' },
  { value: 'ex', label: 'Бывший' },
]

const TARGET_LABEL: Record<Relation, string> = {
  boss: 'Дата рождения босса',
  colleague: 'Дата рождения коллеги',
  ex: 'Дата рождения бывшего',
}

const RELATION_NAME: Record<Relation, string> = {
  boss: 'босс',
  colleague: 'коллега',
  ex: 'бывший',
}

const donutColor = (value: number): ColorToken =>
  value < 0.34 ? 'danger' : value < 0.55 ? 'ochre' : 'sage'

const SignChip = ({ birthday }: { birthday: Date | null }) => {
  if (!birthday) {
    return null
  }
  const meta = ZODIAC_META[getZodiac(birthday)]
  return (
    <HStack gap={9} align='center'>
      <IconBadge char={meta.symbol} tone='gold' shape='circle' size={32} iconSize={17} />
      <Text variant='subhead'>
        {meta.label} · {meta.element}
      </Text>
    </HStack>
  )
}

export const CompatibilityTool = () => {
  const navigate = useNavigate()
  const { data: me } = getMe.useQuery()
  const backfill = useProfileBackfill()
  const { mutate, data, isPending } = checkCompatibility.useMutation()

  const [you, setYou] = useState<Date | null>(null)
  const [youTime, setYouTime] = useState<TimeValue | null>(null)
  const [target, setTarget] = useState<Date | null>(null)
  const [targetTime, setTargetTime] = useState<TimeValue | null>(null)
  const [relation, setRelation] = useState<Relation>('boss')

  useEffect(() => {
    if (me?.birthday) {
      setYou((current) => current ?? me.birthday ?? null)
    }
    if (me?.birthTime) {
      setYouTime((current) => current ?? parseTime(me.birthTime))
    }
  }, [me])

  const goHome = () => navigate('/')

  const share = () => {
    if (typeof navigator !== 'undefined' && navigator.share && data) {
      navigator
        .share({ title: 'Держимся', text: `Совместимость ${data.percent}% — ${data.verdict}` })
        .catch(() => {})
    }
  }

  if (isPending) {
    return <ScreenLoader />
  }

  if (data) {
    return (
      <Layout.Root standalone>
        <Layout.Header variant='hero' spacing={11}>
          <VStack gap={11} align='center'>
            <HStack gap={16} align='center'>
              <VStack gap={6} align='center'>
                <IconBadge
                  char={ZODIAC_META[data.youSign].symbol}
                  tone='onAccent'
                  radius={16}
                  size={52}
                  iconSize={28}
                />
                <Text variant='small' color='accent-fg'>
                  {ZODIAC_META[data.youSign].label} · ты
                </Text>
              </VStack>
              <Text variant='heading' color='accent-fg'>
                ×
              </Text>
              <VStack gap={6} align='center'>
                <IconBadge
                  char={ZODIAC_META[data.targetSign].symbol}
                  tone='onAccent'
                  radius={16}
                  size={52}
                  iconSize={28}
                />
                <Text variant='small' color='accent-fg'>
                  {ZODIAC_META[data.targetSign].label} · {RELATION_NAME[relation]}
                </Text>
              </VStack>
            </HStack>
            <Text variant='mega' color='accent-fg'>
              {data.percent}%
            </Text>
            <Text variant='subhead' color='accent-fg'>
              «{data.verdict}»
            </Text>
          </VStack>
        </Layout.Header>

        <Layout.Body spacing={16}>
          <ScaleResult value={data.scale} leftLabel='катастрофа' rightLabel='идеал' />
          <Text variant='body'>{data.description}</Text>
          <HStack justify='between' gap={8}>
            {data.donuts.map((donut) => (
              <Donut
                key={donut.label}
                value={donut.value}
                caption={donut.label}
                color={donutColor(donut.value)}
                size={68}
              />
            ))}
          </HStack>
          {data.level === 'chart' && (
            <Text variant='small' color='ink-soft' align='center'>
              ✦ учли время рождения обоих — синастрия точнее
            </Text>
          )}
        </Layout.Body>

        <Layout.Footer>
          <Button iconLeft='share-2' onClick={share}>
            Поделиться отчётом
          </Button>
          <Button variant='ghost' iconLeft='home' onClick={goHome}>
            На главную
          </Button>
        </Layout.Footer>
      </Layout.Root>
    )
  }

  return (
    <Layout.Root standalone>
      <Layout.Header variant='bar'>
        <TopBar title='Совместимость' onBack={goHome} />
      </Layout.Header>

      <Layout.Body spacing={16}>
        <Text variant='display'>Сверим звёзды — кто с кем не сошёлся?</Text>

        <VStack gap={10}>
          <DateInput label='Твоя дата рождения' value={you} onChange={setYou} />
          <SignChip birthday={you} />
          <TimePicker
            label='Время рождения'
            optional
            placeholder='со временем — точнее'
            value={youTime}
            onChange={setYouTime}
          />
        </VStack>

        <MascotPlaceholder caption='sloth_astro' height={120} />

        <Field label='Кто это?'>
          <Segment options={RELATIONS} value={relation} onChange={setRelation} />
        </Field>

        <VStack gap={10}>
          <DateInput label={TARGET_LABEL[relation]} value={target} onChange={setTarget} />
          <SignChip birthday={target} />
          <TimePicker
            label='Время рождения'
            optional
            placeholder='если знаешь'
            value={targetTime}
            onChange={setTargetTime}
          />
        </VStack>
      </Layout.Body>

      <Layout.Footer>
        <Button
          iconRight='chevron-right'
          disabled={!you || !target}
          onClick={() => {
            if (you && target) {
              backfill({ birthday: you, birthTime: youTime ? formatTime(youTime) : undefined })
              mutate({
                you: { birthday: you, birthTime: youTime ? formatTime(youTime) : undefined },
                target: {
                  birthday: target,
                  birthTime: targetTime ? formatTime(targetTime) : undefined,
                },
                relation,
              })
            }
          }}
        >
          Проверить совместимость
        </Button>
      </Layout.Footer>
    </Layout.Root>
  )
}
