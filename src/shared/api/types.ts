export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface RequestArgs<Input> {
  url: string
  method: HttpMethod
  input?: Input
  /** Если true — данные берутся из реестра моков по URL, без реального fetch. */
  mocked?: boolean
}
