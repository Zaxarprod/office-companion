import type { IconName } from '~/shared/ui/Icon'

export type NotificationType = 'success' | 'error' | 'warning'

export interface NotificationInput {
  title: string
  subTitle?: string
  iconName?: IconName
}

export interface Notification extends NotificationInput {
  id: number
  type: NotificationType
}

const TTL = 4000

let items: Notification[] = []
let seq = 0
const listeners = new Set<() => void>()

const emit = () => {
  for (const listener of listeners) {
    listener()
  }
}

const dismiss = (id: number) => {
  items = items.filter((item) => item.id !== id)
  emit()
}

const push = (type: NotificationType, input: NotificationInput) => {
  const id = ++seq
  items = [...items, { id, type, ...input }]
  emit()
  setTimeout(() => dismiss(id), TTL)
  return id
}

/** Глобальный стор тостов — вызывается из любого места кода. */
export const notificationStore = {
  success: (input: NotificationInput = { title: 'Готово' }) => push('success', input),
  error: (input: NotificationInput = { title: 'Что-то пошло не так' }) => push('error', input),
  warning: (input: NotificationInput = { title: 'Обрати внимание' }) => push('warning', input),
  dismiss,
}

export const notificationsSubscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const notificationsSnapshot = () => items
