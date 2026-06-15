const FALLBACK_BASE_URL = 'http://localhost:3000/api/v1'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? FALLBACK_BASE_URL

/** true → все запросы идут в моки (офлайн / без бэка). Иначе — реальный API. */
export const USE_MOCKS = import.meta.env.VITE_API_MOCKS === 'true'
