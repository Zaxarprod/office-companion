import { animate, useMotionValue } from 'motion/react'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Sheet } from 'react-modal-sheet'

import { ControllerContext, SheetCloseContext } from './context'
import type { BottomSheetRootProps } from './types'

import styles from './BottomSheet.module.scss'

export function Root({
  children,
  open,
  onClose,
  detent = 'content',
  disableDrag,
  avoidKeyboard,
}: BottomSheetRootProps) {
  const controller = useContext(ControllerContext)
  const isOpen = open ?? controller?.isOpen ?? false

  const controllerClose = controller?.close
  const close = useCallback(() => {
    onClose?.()
    controllerClose?.()
  }, [onClose, controllerClose])

  const closeApi = useMemo(() => ({ close }), [close])

  // Контент монтируется на открытие и размонтируется только после анимации
  // закрытия (onCloseEnd) — список/состояние сбрасываются на каждый показ,
  // но анимация ухода не рвётся.
  const [rendered, setRendered] = useState(false)
  useEffect(() => {
    if (isOpen) {
      setRendered(true)
    }
  }, [isOpen])

  const shouldRender = isOpen || rendered

  // Собственная прозрачность бэкдропа: lib привязывает её к yProgress, который
  // при прерванном закрытии остаётся «застрявшим» и при ремаунте даёт вспышку.
  const backdropOpacity = useMotionValue(0)
  useEffect(() => {
    const controls = animate(backdropOpacity, isOpen ? 1 : 0, { duration: 0.25 })
    return () => controls.stop()
  }, [isOpen, backdropOpacity])

  return (
    <Sheet
      isOpen={isOpen}
      onClose={close}
      detent={detent}
      disableDrag={disableDrag}
      avoidKeyboard={avoidKeyboard}
      onCloseEnd={() => setRendered(false)}
    >
      <Sheet.Container className={styles.container} unstyled>
        <Sheet.Header className={styles.dragHeader} unstyled>
          <span className={styles.grabber} />
        </Sheet.Header>
        {shouldRender && (
          <SheetCloseContext.Provider value={closeApi}>{children}</SheetCloseContext.Provider>
        )}
      </Sheet.Container>
      <Sheet.Backdrop
        className={styles.backdrop}
        style={{ opacity: backdropOpacity }}
        onTap={close}
      />
    </Sheet>
  )
}
