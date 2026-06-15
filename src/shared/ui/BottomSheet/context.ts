import { createContext } from 'react'

/** Внешний контроллер (из фабрики): открыт/закрыт + close. */
export interface SheetController {
  isOpen: boolean
  close: () => void
}

export const ControllerContext = createContext<SheetController | null>(null)

/** Доступ к close для дочерних элементов листа (кнопка закрытия в Header). */
export interface SheetCloseApi {
  close: () => void
}

export const SheetCloseContext = createContext<SheetCloseApi>({ close: () => {} })
