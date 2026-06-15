import type { UserDto } from './user'

/** Способ входа. Сессия после любого из них — одинаковая. */
export type AuthProvider = 'telegram' | 'web'

export interface TelegramAuthInput {
  /** Сырая строка Telegram WebApp initData. */
  initData: string
}

export interface AuthSessionDto {
  token: string
  user: UserDto
}
