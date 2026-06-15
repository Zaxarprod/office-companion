import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CitySingleSelect, getCities } from '~/modules/city'
import { getMe, useProfileBackfill } from '~/modules/user'
import { ZODIAC_META, getAscendant, getZodiac } from '~/shared/lib/zodiac'
import type { ZodiacSign } from '~/shared/lib/zodiac'
import {
  Button,
  Card,
  DateInput,
  HStack,
  IconBadge,
  Layout,
  MascotPlaceholder,
  Pill,
  ScreenLoader,
  Text,
  TimePicker,
  TopBar,
  VStack,
} from '~/shared/ui'
import type { TimeValue } from '~/shared/ui'

import { getHoroscope } from '../../api/horoscope'
import type { HoroscopeInput } from '../../types'

const pad = (n: number) => String(n).padStart(2, '0')
const parseTime = (value?: string): TimeValue | null => {
  if (!value) {
    return null
  }
  const [hours, minutes] = value.split(':').map(Number)
  return { hours: hours || 0, minutes: minutes || 0 }
}
const formatTime = (time: TimeValue) => `${pad(time.hours)}:${pad(time.minutes)}`

const todayLabel = () =>
  new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }).format(
    new Date(),
  )

const HoroscopeResult = ({
  sign,
  input,
  onHome,
}: {
  sign: ZodiacSign
  input: HoroscopeInput
  onHome: () => void
}) => {
  const { data } = getHoroscope.useQuery(input)

  const share = () => {
    if (typeof navigator !== 'undefined' && navigator.share && data) {
      navigator
        .share({ title: 'Держимся', text: `Мой расклад: ${data.signLabel}. ${data.lead}` })
        .catch(() => {})
    }
  }

  if (!data) {
    return <ScreenLoader />
  }

  return (
    <Layout.Root standalone>
      <Layout.Header variant='hero' spacing={0}>
        <HStack gap={14} align='center'>
          <IconBadge char={ZODIAC_META[sign].symbol} tone='onAccent' shape='circle' size={56} iconSize={30} />
          <VStack gap={2}>
            <Text variant='label' color='accent-fg'>
              Сегодня · {todayLabel()}
            </Text>
            <Text variant='heading' color='accent-fg'>
              {data.signLabel}
            </Text>
            <Text variant='caption' color='accent-fg'>
              {data.dates} · {data.element}
            </Text>
            {data.ascendant && (
              <Text variant='caption' color='accent-fg'>
                восходящий — {ZODIAC_META[data.ascendant].label}
              </Text>
            )}
          </VStack>
        </HStack>
      </Layout.Header>

      <Layout.Body spacing={14}>
        {data.mercuryRetrograde && <Pill tone='ochre'>☿ Меркурий ретроградит</Pill>}
        {data.level === 'chart' && <Pill tone='sage'>✦ по натальной карте</Pill>}
        <Text variant='body'>{data.lead}</Text>
        <VStack gap={9}>
          {data.aspects.map((aspect) => (
            <Card key={aspect.label}>
              <HStack gap={11} align='center'>
                <IconBadge icon='zap' tone={aspect.tone} size={34} radius={10} iconSize={17} />
                <VStack gap={1} grow={1}>
                  <Text variant='subhead'>{aspect.label}</Text>
                  <Text variant='small' color='ink-soft'>
                    {aspect.text}
                  </Text>
                </VStack>
              </HStack>
            </Card>
          ))}
        </VStack>
      </Layout.Body>

      <Layout.Footer>
        <Button iconLeft='share-2' onClick={share}>
          Поделиться раскладом
        </Button>
        <Button variant='ghost' iconLeft='home' onClick={onHome}>
          На главную
        </Button>
      </Layout.Footer>
    </Layout.Root>
  )
}

export const HoroscopeTool = () => {
  const navigate = useNavigate()
  const { data: me } = getMe.useQuery()
  const { data: cities } = getCities.useQuery()
  const backfill = useProfileBackfill()
  const [birthday, setBirthday] = useState<Date | null>(null)
  const [time, setTime] = useState<TimeValue | null>(null)
  const [birthCity, setBirthCity] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Префилл из профиля (один раз). Есть время → сразу раскрываем уточнение.
  useEffect(() => {
    if (me?.birthday) {
      setBirthday((current) => current ?? me.birthday ?? null)
    }
    if (me?.birthTime) {
      setTime((current) => current ?? parseTime(me.birthTime))
      setShowDetails(true)
    }
    if (me?.birthCity) {
      setBirthCity((current) => current ?? me.birthCity ?? null)
      setShowDetails(true)
    }
  }, [me])

  const sign = birthday ? getZodiac(birthday) : null
  const goHome = () => navigate('/')

  const city = cities?.find((item) => item.name === birthCity)
  // Асцендент считаем на клиенте (без эфемерид) для мгновенного показа.
  const ascendant =
    birthday && time && city?.lat != null && city.lon != null && city.tz != null
      ? getAscendant(birthday, time.hours, time.minutes, city.lat, city.lon, city.tz)
      : null

  if (submitted && sign && birthday) {
    const input: HoroscopeInput = {
      birthday: birthday.toISOString().slice(0, 10),
      birthTime: time ? formatTime(time) : undefined,
      lat: city?.lat,
      lon: city?.lon,
      tz: city?.tz,
    }
    return <HoroscopeResult sign={sign} input={input} onHome={goHome} />
  }

  return (
    <Layout.Root standalone>
      <Layout.Header variant='bar'>
        <TopBar title='Офисный гороскоп' onBack={goHome} />
      </Layout.Header>

      <Layout.Body spacing={16}>
        <VStack gap={6}>
          <Text variant='display'>Что звёзды думают про твой рабочий день?</Text>
          <Text variant='caption' color='ink-soft'>
            Расскажи, когда ты родился — спросим у Меркурия (он опять ретроградит).
          </Text>
        </VStack>

        <MascotPlaceholder caption='astrologer_sloth' height={188} tint='gold' />

        <DateInput label='Дата рождения' value={birthday} onChange={setBirthday} />

        {showDetails ? (
          <VStack gap={8}>
            <Text variant='label' color='ink-soft'>
              Для натальной карты — точнее (Луна и асцендент)
            </Text>
            <HStack gap={10} align='start'>
              <VStack grow={1}>
                <TimePicker label='Время' optional placeholder='часы' value={time} onChange={setTime} />
              </VStack>
              <VStack grow={1}>
                <CitySingleSelect
                  label='Место'
                  optional
                  placeholder='город'
                  value={birthCity}
                  onChange={setBirthCity}
                />
              </VStack>
            </HStack>
          </VStack>
        ) : (
          <Button variant='ghost' iconLeft='map-pin' onClick={() => setShowDetails(true)}>
            Уточнить время и место рождения
          </Button>
        )}

        {sign && (
          <Card>
            <HStack gap={12} align='center'>
              <IconBadge char={ZODIAC_META[sign].symbol} tone='gold' size={44} radius={13} iconSize={24} />
              <VStack gap={1}>
                <Text variant='label' color='ink-soft'>
                  Твой знак
                </Text>
                <Text variant='subhead'>
                  {ZODIAC_META[sign].label} · {ZODIAC_META[sign].element}
                  {ascendant ? ` · асц. ${ZODIAC_META[ascendant].label}` : ''}
                </Text>
              </VStack>
            </HStack>
          </Card>
        )}
      </Layout.Body>

      <Layout.Footer>
        <Button
          iconRight='chevron-right'
          disabled={!sign}
          onClick={() => {
            backfill({
              birthday: birthday ?? undefined,
              birthTime: time ? formatTime(time) : undefined,
              birthCity: birthCity ?? undefined,
            })
            setSubmitted(true)
          }}
        >
          Узнать расклад на сегодня
        </Button>
      </Layout.Footer>
    </Layout.Root>
  )
}
