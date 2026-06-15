import { useNavigate } from 'react-router-dom'

import {
  BottomSheet,
  Button,
  HStack,
  IconBadge,
  Pill,
  Text,
  VStack,
  createBottomSheetModalWrapper,
} from '~/shared/ui'
import type { IconName } from '~/shared/ui'

export interface UpsellData {
  feature: string
  icon: IconName
  description: string
}

const PERKS = [
  'Сценарии под повышение и нагрузку',
  'Полный доступ к «Недоплачивают»',
  'Недельные отчёты и автопоиск вакансий',
]

const UpsellContent = () => {
  const data = sheet.useBottomSheetData()
  const { close } = sheet.useController()
  const navigate = useNavigate()

  const openPremium = () => {
    close()
    navigate('/premium')
  }

  return (
    <BottomSheet.Root>
      <BottomSheet.Body>
        <VStack gap={12} align='start'>
          <Pill tone='gold' iconLeft='lock'>
            Premium
          </Pill>
          <IconBadge icon={data.icon} tone='accent' size={56} radius={16} iconSize={28} />
          <Text variant='heading'>{data.feature}</Text>
          <Text variant='caption' color='ink-soft'>
            {data.description}
          </Text>
          <VStack gap={9}>
            {PERKS.map((perk) => (
              <HStack key={perk} gap={10} align='center'>
                <IconBadge icon='check' tone='sage' shape='circle' size={20} iconSize={12} />
                <Text variant='caption'>{perk}</Text>
              </HStack>
            ))}
          </VStack>
          <Button onClick={openPremium}>Открыть Premium · 199 ₽/мес</Button>
          <Text variant='small' color='ink-soft'>
            Уже есть подписка? Восстановить
          </Text>
        </VStack>
      </BottomSheet.Body>
    </BottomSheet.Root>
  )
}

const sheet = createBottomSheetModalWrapper<UpsellData>(UpsellContent)

export const UpsellSheet = sheet.Component
export const useUpsell = sheet.useController
