import type { ReactNode, RefObject } from 'react'

export type BottomSheetDetent = 'default' | 'content' | 'full'

export interface BottomSheetRootProps {
  children?: ReactNode
  /** Контролируемое состояние (если лист используется без фабрики). */
  open?: boolean
  onClose?: () => void
  /** Высота листа: content — по контенту (по умолчанию). */
  detent?: BottomSheetDetent
  disableDrag?: boolean
  /** Подъём листа при фокусе инпута (по умолчанию вкл). Для списков с поиском лучше выключать. */
  avoidKeyboard?: boolean
}

export interface BottomSheetHeaderProps {
  title?: string
  closeButton?: boolean
}

export interface BottomSheetBodyProps {
  children?: ReactNode
  /** Ссылка на скроллер листа — нужна для виртуализации списка. */
  scrollRef?: RefObject<HTMLDivElement | null>
  /** Отключить drag-to-dismiss внутри контента (для колёс/скролла). */
  disableDrag?: boolean
}
