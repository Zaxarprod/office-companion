import type { AuthProvider } from '@contracts/auth'

import { config } from '../config'
import { verifyTelegramInitData } from './init-data'

export interface VerifiedIdentity {
  externalId: string
  profile: { name: string; avatarUrl?: string }
}

/** Стратегия логина: проверить креды провайдера → identity (или null). */
export interface AuthStrategy {
  verify(payload: unknown): Promise<VerifiedIdentity | null>
}

const telegramStrategy: AuthStrategy = {
  async verify(payload) {
    const initData = (payload as { initData?: string } | null)?.initData
    if (!initData || !config.botToken) {
      return null
    }
    const user = verifyTelegramInitData(initData, config.botToken)
    if (!user) {
      return null
    }
    const name =
      [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Друг'
    return { externalId: String(user.id), profile: { name, avatarUrl: user.photo_url } }
  },
}

// Заглушка для локалки (AUTH_DEV=1): вход без Telegram.
const devStrategy: AuthStrategy = {
  async verify(payload) {
    const data = (payload ?? {}) as { externalId?: string; name?: string }
    return { externalId: data.externalId ?? 'dev', profile: { name: data.name ?? 'Алиса' } }
  },
}

const registry: Record<AuthProvider, AuthStrategy | undefined> = {
  telegram: telegramStrategy,
  web: config.authDev ? devStrategy : undefined,
}

export const getStrategy = (provider: string): AuthStrategy | null => {
  if (provider !== 'telegram' && provider !== 'web') {
    return null
  }
  return registry[provider] ?? null
}
