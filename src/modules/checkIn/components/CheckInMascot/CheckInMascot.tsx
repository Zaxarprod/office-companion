import { Text } from '~/shared/ui'

import styles from './CheckInMascot.module.scss'

export interface CheckInMascotProps {
  /** Имя иллюстрации (пока плейсхолдер — арт подставим позже). */
  image: string
}

export const CheckInMascot = ({ image }: CheckInMascotProps) => (
  <div className={styles.mascot}>
    <Text variant='label' color='ink-faint'>
      {image || 'маскот'}
    </Text>
  </div>
)
