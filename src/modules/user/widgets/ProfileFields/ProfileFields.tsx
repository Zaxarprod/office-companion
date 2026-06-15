import { CitySingleSelect } from '~/modules/city'
import { Card, CountrySelect, DateInput, Divider, ListRow, Text, TimePicker, VStack } from '~/shared/ui'
import type { TimeValue } from '~/shared/ui'

import { getMe, updateMe } from '../../api/user'
import { GradeSelect } from '../../components/GradeSelect'
import { ProfessionSelect } from '../../components/ProfessionSelect'
import { ProfileDurationField } from '../ProfileDurationField'

const formatBirthday = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(date)
    .replace(/\s*г\.$/, '')

const pad = (n: number) => String(n).padStart(2, '0')

const parseTime = (value?: string): TimeValue | null => {
  if (!value) {
    return null
  }
  const [hours, minutes] = value.split(':').map(Number)
  return { hours: hours || 0, minutes: minutes || 0 }
}

const formatTime = (time: TimeValue) => `${pad(time.hours)}:${pad(time.minutes)}`

export const ProfileFields = () => {
  const { data } = getMe.useQuery()
  const invalidate = getMe.useInvalidate()
  const { mutate } = updateMe.useMutation({ onSuccess: () => invalidate() })

  return (
    <>
      <VStack gap={9}>
        <Text variant='label' color='ink-soft'>
          Личное
        </Text>
        <Card padding={0}>
          <DateInput
            value={data?.birthday ?? null}
            onChange={(birthday) => {
              if (birthday) {
                mutate({ birthday })
              }
            }}
            renderTrigger={({ value, onOpen }) => (
              <ListRow
                icon='calendar'
                iconTone='gold'
                label='Дата рождения'
                value={value ? formatBirthday(value) : undefined}
                placeholder='не указано'
                onClick={onOpen}
              />
            )}
          />
          <Divider />
          <TimePicker
            value={parseTime(data?.birthTime)}
            onChange={(time) => mutate({ birthTime: formatTime(time) })}
            renderTrigger={({ formatted, onOpen }) => (
              <ListRow
                icon='clock'
                iconTone='ochre'
                label='Время рождения'
                value={formatted ?? undefined}
                placeholder='не указано · для точности'
                onClick={onOpen}
              />
            )}
          />
          <Divider />
          <CitySingleSelect
            value={data?.birthCity ?? null}
            onChange={(birthCity) => mutate({ birthCity })}
            renderTrigger={({ selected, onOpen }) => (
              <ListRow
                icon='map-pin'
                iconTone='sage'
                label='Место рождения'
                value={selected?.label ?? undefined}
                placeholder='не указано · для асцендента'
                onClick={onOpen}
              />
            )}
          />
        </Card>
      </VStack>

      <VStack gap={9}>
        <Text variant='label' color='ink-soft'>
          Работа
        </Text>
        <Card padding={0}>
          <CountrySelect
            value={data?.country ?? null}
            onChange={(country) => mutate({ country })}
            renderTrigger={({ selected, onOpen }) => (
              <ListRow
                icon='globe'
                iconTone='accent'
                label='Страна'
                value={selected ? `${selected.flag} ${selected.name}` : undefined}
                placeholder='не указано'
                onClick={onOpen}
              />
            )}
          />
          <Divider />
          <CitySingleSelect
            value={data?.city ?? null}
            onChange={(city) => mutate({ city })}
            renderTrigger={({ selected, onOpen }) => (
              <ListRow
                icon='map-pin'
                iconTone='coral'
                label='Город'
                value={selected?.label ?? undefined}
                placeholder='не указано'
                onClick={onOpen}
              />
            )}
          />
          <Divider />
          <ProfessionSelect
            value={data?.profession ?? null}
            onChange={(profession) => mutate({ profession })}
            renderTrigger={({ valueLabel, onOpen }) => (
              <ListRow
                icon='briefcase'
                iconTone='accent'
                label='Профессия'
                value={valueLabel ?? undefined}
                placeholder='не указано'
                onClick={onOpen}
              />
            )}
          />
          <Divider />
          <GradeSelect
            value={data?.grade ?? null}
            onChange={(grade) => mutate({ grade })}
            renderTrigger={({ valueLabel, onOpen }) => (
              <ListRow
                icon='check'
                iconTone='sage'
                label='Должность / грейд'
                value={valueLabel ?? undefined}
                placeholder='не указано'
                onClick={onOpen}
              />
            )}
          />
          <Divider />
          <ProfileDurationField
            icon='trending-up'
            iconTone='gold'
            label='Опыт работы'
            value={{
              years: data?.experienceYears ?? null,
              months: data?.experienceMonths ?? null,
            }}
            placeholder='не указано'
            title='Опыт работы'
            onSubmit={(duration) =>
              mutate({
                experienceYears: duration.years ?? undefined,
                experienceMonths: duration.months ?? undefined,
              })
            }
          />
        </Card>
      </VStack>
    </>
  )
}
