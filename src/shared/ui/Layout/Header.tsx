import { VStack } from '~/shared/ui/Stack'

import type { LayoutHeaderProps } from './types'

import styles from './Layout.module.scss'

export const Header = ({
  children,
  spacing = 14,
  variant = 'hero',
}: LayoutHeaderProps) => (
  <header className={styles[`header-${variant}`]}>
    <VStack gap={spacing}>{children}</VStack>
  </header>
)
