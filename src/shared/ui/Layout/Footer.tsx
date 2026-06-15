import { VStack } from '~/shared/ui/Stack'

import type { LayoutFooterProps } from './types'

import styles from './Layout.module.scss'

export const Footer = ({ children, spacing = 10 }: LayoutFooterProps) => (
  <footer className={styles.footer}>
    <VStack gap={spacing}>{children}</VStack>
  </footer>
)
