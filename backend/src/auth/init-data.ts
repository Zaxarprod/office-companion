import crypto from 'node:crypto'

export interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

/**
 * Проверка Telegram WebApp initData: HMAC-SHA256 боттокеном + свежесть auth_date.
 * Возвращает пользователя или null, если подпись/срок не сошлись.
 */
export const verifyTelegramInitData = (
  initData: string,
  botToken: string,
  maxAgeSec = 86_400,
): TelegramUser | null => {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) {
    return null
  }
  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computed = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex')
  if (computed !== hash) {
    return null
  }

  const authDate = Number(params.get('auth_date') ?? 0)
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) {
    return null
  }

  const userRaw = params.get('user')
  if (!userRaw) {
    return null
  }
  return JSON.parse(userRaw) as TelegramUser
}
