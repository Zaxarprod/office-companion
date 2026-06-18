import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CitySingleSelect } from '~/modules/city'
import { ProfessionSelect, getMe, useProfileBackfill } from '~/modules/user'
import {
  Button,
  Callout,
  Card,
  Chips,
  CountrySelect,
  DistributionChart,
  DurationInput,
  Field,
  HStack,
  IconBadge,
  IconButton,
  Layout,
  MoneyText,
  NumberInput,
  Pill,
  ScreenLoader,
  Segment,
  Text,
  TextInput,
  TopBar,
  VStack,
} from '~/shared/ui'
import type { ChipOption, DistributionBar, DurationValue } from '~/shared/ui'

import { getSalaryFork, getSalaryQuota } from '../../api/salary'
import type { SalaryFork, SalaryForkInput, Vacancy } from '../../types'

import styles from './SalaryTool.module.scss'

const OTHER = '__other__'

const GRADES: ChipOption<string>[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: OTHER, label: 'Другое' },
]

const CANON = ['junior', 'middle', 'senior', 'lead']

const k = (value: number) => `${Math.round(value / 1000)}к`

const VacancyCard = ({ vacancy }: { vacancy: Vacancy }) => (
  <Card>
    <VStack gap={8}>
      <HStack gap={10} align='center'>
        <IconBadge icon='briefcase' tone='gold' size={32} radius={9} iconSize={16} />
        <VStack gap={1} grow={1}>
          <Text variant='subhead'>{vacancy.role}</Text>
          <Text variant='small' color='ink-soft'>
            {vacancy.company}
          </Text>
        </VStack>
        <Pill tone='ochre'>{vacancy.source.toUpperCase()}</Pill>
      </HStack>
      <HStack gap={8} align='center'>
        <MoneyText amount={vacancy.salary} variant='subhead' />
        <Pill tone='sage' iconRight='arrow-up-right'>
          +{k(vacancy.diff)}
        </Pill>
      </HStack>
    </VStack>
  </Card>
)

const SalaryResult = ({ fork, onHome }: { fork: SalaryFork; onHome: () => void }) => {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'hot' | 'cities'>('hot')

  const medianIndex = fork.distribution.reduce(
    (best, bucket, index, all) => (bucket.value > all[best].value ? index : best),
    0,
  )
  const bars: DistributionBar[] = fork.distribution.map((bucket, index) => ({
    value: bucket.value,
    tone: index === fork.you?.bucketIndex ? 'coral' : index === medianIndex ? 'accent' : undefined,
    arrow: index === fork.you?.bucketIndex,
  }))

  // Тизер «других городов»: те же карточки, но заблюренные, поверх — CTA в Premium.
  const teaser = fork.vacancies.slice(0, 3)

  return (
    <Layout.Root standalone>
      <Layout.Header variant='hero' spacing={0}>
        <HStack justify='between' align='center'>
          <Text variant='subhead' color='accent-fg'>
            {fork.role}
          </Text>
          <IconButton icon='x' label='Закрыть' variant='onAccent' size={32} onClick={onHome} />
        </HStack>
      </Layout.Header>

      <Layout.Body spacing={16}>
        <Card radius='xl' shadow='float'>
          <VStack gap={14}>
            <HStack justify='between' align='end'>
              <VStack gap={3}>
                <Text variant='label' color='ink-soft'>
                  Медиана
                </Text>
                <MoneyText amount={fork.median} variant='display' />
              </VStack>
              <VStack gap={1} align='end'>
                <Text variant='small' color='ink-soft'>
                  вилка
                </Text>
                <Text variant='subhead'>
                  {k(fork.range[0])}–{k(fork.range[1])}
                </Text>
              </VStack>
            </HStack>

            <VStack gap={7}>
              <DistributionChart data={bars} height={60} />
              <HStack justify='between'>
                <Text variant='micro' color='ink-faint'>
                  {k(fork.range[0])}
                </Text>
                <Text variant='micro' color='ink-faint'>
                  {k(fork.median)}
                </Text>
                <Text variant='micro' color='ink-faint'>
                  {k(fork.range[1])}
                </Text>
              </HStack>
            </VStack>

            {fork.you && (
              <Callout tone='coral'>
                <Text variant='caption'>{fork.you.diffText}</Text>
              </Callout>
            )}
          </VStack>
        </Card>

        <Segment
          options={[
            { value: 'hot', label: 'Крутые вакансии' },
            { value: 'cities', label: 'В других городах платят больше' },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === 'hot' ? (
          <VStack gap={9}>
            {fork.vacancies.map((vacancy) => (
              <VacancyCard key={vacancy.id} vacancy={vacancy} />
            ))}
          </VStack>
        ) : (
          <div className={styles.teaser}>
            <div className={styles.locked}>
              <VStack gap={9}>
                {teaser.map((vacancy) => (
                  <VacancyCard key={vacancy.id} vacancy={vacancy} />
                ))}
              </VStack>
            </div>
            <div className={styles.cta}>
              <Button iconLeft='crown' fullWidth={false} onClick={() => navigate('/premium')}>
                Посмотреть с PRO
              </Button>
            </div>
          </div>
        )}
      </Layout.Body>

      <Layout.Footer>
        <Button iconLeft='check' onClick={onHome}>
          Сохранить отчёт
        </Button>
      </Layout.Footer>
    </Layout.Root>
  )
}

export const SalaryTool = () => {
  const navigate = useNavigate()
  const { data: me } = getMe.useQuery()
  const { mutate, data, isPending } = getSalaryFork.useMutation()
  const invalidateQuota = getSalaryQuota.useInvalidate()
  const { data: quota } = getSalaryQuota.useQuery()
  const backfill = useProfileBackfill()

  const [country, setCountry] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [profession, setProfession] = useState<string | null>(null)
  const [gradeChip, setGradeChip] = useState<string>('middle')
  const [customGrade, setCustomGrade] = useState('')
  const [experience, setExperience] = useState<DurationValue>({ years: null, months: null })
  const [salary, setSalary] = useState<number | null>(null)

  useEffect(() => {
    if (!me) {
      return
    }
    setCountry((current) => current ?? me.country ?? null)
    setCity((current) => current ?? me.city ?? null)
    setProfession((current) => current ?? me.profession ?? null)
    if (me.grade) {
      if (CANON.includes(me.grade)) {
        setGradeChip(me.grade)
      } else {
        setGradeChip(OTHER)
        setCustomGrade(me.grade)
      }
    }
    setExperience((current) =>
      current.years == null && current.months == null
        ? { years: me.experienceYears ?? null, months: me.experienceMonths ?? null }
        : current,
    )
  }, [me])

  const grade = gradeChip === OTHER ? customGrade.trim() : gradeChip
  const goHome = () => navigate('/')
  const ready = !!country && !!city && !!profession && !!grade

  const submit = () => {
    if (!ready) {
      return
    }
    mutate(
      {
        country: country ?? '',
        city: city ?? '',
        profession: profession ?? '',
        grade,
        experienceYears: experience.years ?? undefined,
        experienceMonths: experience.months ?? undefined,
        currentSalary: salary ?? undefined,
      } satisfies SalaryForkInput,
      { onSuccess: () => invalidateQuota() },
    )
    backfill({
      country: country ?? undefined,
      city: city ?? undefined,
      profession: profession ?? undefined,
      grade: grade || undefined,
      experienceYears: experience.years ?? undefined,
      experienceMonths: experience.months ?? undefined,
    })
  }

  if (isPending) {
    return <ScreenLoader />
  }

  if (data) {
    return <SalaryResult fork={data} onHome={goHome} />
  }

  return (
    <Layout.Root standalone>
      <Layout.Header variant='bar'>
        <TopBar title='Сравнение с рынком' onBack={goHome} />
      </Layout.Header>

      <Layout.Body spacing={14}>
        <VStack gap={6}>
          <Text variant='display'>Сколько тебе недоплачивают?</Text>
          <Text variant='caption' color='ink-soft'>
            4 поля — и покажем вилку по твоей роли. Данные не уходят на сервер.
          </Text>
        </VStack>

        <CountrySelect value={country} onChange={setCountry} />
        <CitySingleSelect value={city} onChange={setCity} />
        <ProfessionSelect value={profession} onChange={setProfession} label='Профессия' />

        <Field label='Грейд'>
          <VStack gap={9}>
            <Chips options={GRADES} value={gradeChip} onChange={setGradeChip} />
            {gradeChip === OTHER && (
              <TextInput value={customGrade} onChange={setCustomGrade} placeholder='Свой грейд' />
            )}
          </VStack>
        </Field>

        <DurationInput label='Опыт работы' optional value={experience} onChange={setExperience} />

        <NumberInput
          label='Текущая зарплата'
          optional
          value={salary}
          onChange={setSalary}
          suffix='₽'
          placeholder='220 000'
        />
      </Layout.Body>

      <Layout.Footer>
        {quota && quota.left === 0 ? (
          <VStack gap={9}>
            <Callout tone='coral'>
              <Text variant='caption'>Лимит бесплатных запросов исчерпан. Сбросится в следующем месяце.</Text>
            </Callout>
            <Button iconLeft='crown' onClick={() => navigate('/premium')}>
              Открыть PRO
            </Button>
          </VStack>
        ) : (
          <VStack gap={9}>
            {quota && quota.left < quota.total && (
              <Text variant='caption' color='ink-soft' align='center'>
                Бесплатных запросов: {quota.left} из {quota.total}
              </Text>
            )}
            <Button iconRight='chevron-right' disabled={!ready} onClick={submit}>
              Показать вилку
            </Button>
          </VStack>
        )}
      </Layout.Footer>
    </Layout.Root>
  )
}
