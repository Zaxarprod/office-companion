/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** База реального API, напр. http://localhost:3000/api/v1 */
  readonly VITE_API_URL?: string
  /** 'true' → все запросы в моки (офлайн, без бэка). */
  readonly VITE_API_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
