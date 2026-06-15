import { VStack } from '~/shared/ui/Stack'

import type { LayoutBodyProps } from './types'

import styles from './Layout.module.scss'

export const Body = ({ children, spacing = 16 }: LayoutBodyProps) => (
  <div className={styles.body}>
    <VStack gap={spacing}>{children}</VStack>
  </div>
)
