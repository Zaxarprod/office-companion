import cn from 'classnames'

import { Text } from '~/shared/ui/Text'

import styles from './MascotPlaceholder.module.scss'

export interface MascotPlaceholderProps {
  /** Имя будущего арта (плейсхолдер до реальных иллюстраций). */
  caption?: string
  height?: number
  tint?: 'sand' | 'gold'
}

export const MascotPlaceholder = ({
  caption,
  height = 200,
  tint = 'sand',
}: MascotPlaceholderProps) => (
  <div className={cn(styles.box, styles[tint])} style={{ height }}>
    {caption && (
      <Text variant='label' color='ink-faint'>
        {caption}
      </Text>
    )}
  </div>
)
