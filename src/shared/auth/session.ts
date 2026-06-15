import type { AuthSessionDto } from '@contracts/auth'

import { API_BASE_URL, getToken, setToken } from '~/shared/api'

declare global {
  interface Window {
    Telegram?: { WebApp?: { initData?: string } }
  }
}

/**
 * Гарантирует наличие сессии. Telegram Mini App — через initData,
 * иначе (локалка/PWA-дев) — dev-провайдер `web`. Платформенная специфика — только здесь.
 */
export const ensureSession = async (): Promise<void> => {
  if (getToken()) {
    return
  }

  const initData = window.Telegram?.WebApp?.initData
  const provider = initData ? 'telegram' : 'web'
  const body = initData ? { initData } : { externalId: 'dev' }

  const response = await fetch(`${API_BASE_URL}/auth/${provider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`auth ${provider} → ${response.status}`)
  }

  const session = (await response.json()) as AuthSessionDto
  setToken(session.token)
}
