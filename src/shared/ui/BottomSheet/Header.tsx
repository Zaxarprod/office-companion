import { useContext } from 'react'

import { IconButton } from '~/shared/ui/IconButton'
import { Text } from '~/shared/ui/Text'

import { SheetCloseContext } from './context'
import type { BottomSheetHeaderProps } from './types'

import styles from './BottomSheet.module.scss'

export function Header({ title, closeButton }: BottomSheetHeaderProps) {
  const { close } = useContext(SheetCloseContext)

  return (
    <div className={styles.head}>
      {title ? <Text variant='heading'>{title}</Text> : <span />}
      {closeButton && <IconButton icon='x' label='Закрыть' size={34} onClick={close} />}
    </div>
  )
}
