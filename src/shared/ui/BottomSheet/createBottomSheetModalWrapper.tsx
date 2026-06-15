import { useSyncExternalStore } from 'react'
import type { ComponentType } from 'react'

import { ControllerContext } from './context'

type SheetState<TData> = {
  isOpen: boolean
  data: TData | null
  /** Хоть раз открывали — после этого держим лист смонтированным (для анимации закрытия). */
  everOpened: boolean
}

// Если TData === void — open() без аргументов; иначе open(data) обязателен.
type OpenFn<TData> = [TData] extends [void] ? () => void : (data: TData) => void

export interface BottomSheetController<TData> {
  isOpen: boolean
  open: OpenFn<TData>
  close: () => void
}

export interface BottomSheetModal<TData> {
  /** Рендерится один раз где угодно в дереве; сам лист. */
  Component: ComponentType
  /** Управление из любого компонента (даже там, где Component не объявлен). */
  useController: () => BottomSheetController<TData>
  /** Данные, переданные в open(data). */
  useBottomSheetData: () => TData
}

export function createBottomSheetModalWrapper<TData = void>(
  Content: ComponentType,
): BottomSheetModal<TData> {
  // Стор на уровне модуля — поэтому open/close работают вне поддерева Component.
  let state: SheetState<TData> = {
    isOpen: false,
    data: null,
    everOpened: false,
  }
  const listeners = new Set<() => void>()

  const emit = () => {
    for (const listener of listeners) {
      listener()
    }
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const getSnapshot = () => state

  const open = (data?: TData) => {
    state = { isOpen: true, data: data ?? null, everOpened: true }
    emit()
  }

  const close = () => {
    state = { ...state, isOpen: false }
    emit()
  }

  function Component() {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

    // До первого open() не монтируем Content — «ждём данных».
    if (!snapshot.everOpened) {
      return null
    }

    return (
      <ControllerContext.Provider value={{ isOpen: snapshot.isOpen, close }}>
        <Content />
      </ControllerContext.Provider>
    )
  }

  const useController = (): BottomSheetController<TData> => {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
    return { isOpen: snapshot.isOpen, open: open as OpenFn<TData>, close }
  }

  const useBottomSheetData = (): TData => {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
    return snapshot.data as TData
  }

  return { Component, useController, useBottomSheetData }
}
