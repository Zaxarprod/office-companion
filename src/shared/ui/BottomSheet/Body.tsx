import { Sheet } from 'react-modal-sheet'

import type { BottomSheetBodyProps } from './types'

import styles from './BottomSheet.module.scss'

export function Body({
  children,
  scrollRef,
  disableDrag,
}: BottomSheetBodyProps) {
  return (
    <Sheet.Content
      className={styles.body}
      scrollRef={scrollRef}
      disableDrag={disableDrag}
    >
      {children}
    </Sheet.Content>
  )
}
