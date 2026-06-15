import type { IconName } from '~/shared/ui/Icon'

export type InteractiveCardTint = 'accent' | 'gold' | 'ochre' | 'coral' | 'sage' | 'danger'

export interface InteractiveCardProps {
  icon: IconName
  title: string
  subtitle?: string
  tint?: InteractiveCardTint
  onClick?: () => void
  /** Лейбл-бейдж в углу (напр. «PRO») — рендерится как Pill. */
  extraLabel?: string
}
