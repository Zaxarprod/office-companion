const STORAGE_KEY = 'derzhimsya.token'

let cached: string | null | undefined

export const getToken = (): string | null => {
  if (cached === undefined) {
    cached = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)
  }
  return cached
}

export const setToken = (token: string): void => {
  cached = token
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, token)
  }
}

export const clearToken = (): void => {
  cached = null
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
