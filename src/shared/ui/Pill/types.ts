import type { ReactNode } from 'react'

import type { IconName } from '~/shared/ui/Icon'

export type PillTone = 'accent' | 'sage' | 'gold' | 'ochre' | 'coral' | 'danger' | 'primary'

export interface PillProps {
  children?: ReactNode
  tone?: PillTone
  iconLeft?: IconName
  iconRight?: IconName
}
