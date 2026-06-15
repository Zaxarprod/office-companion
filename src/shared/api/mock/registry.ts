import type { HttpMethod } from '../types'

export type MockHandler<Input = unknown, Output = unknown> = (
  input: Input,
) => Output | Promise<Output>

const registry = new Map<string, MockHandler>()

/** Имитация сетевой задержки, чтобы лоадинги вели себя как с реальным бэком. */
const MOCK_DELAY_MS = 400

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const key = (method: HttpMethod, url: string) => `${method} ${url}`

export function registerMock<Input, Output>(
  method: HttpMethod,
  url: string,
  handler: MockHandler<Input, Output>,
) {
  registry.set(key(method, url), handler as MockHandler)
}

export async function resolveMock<Output>(
  method: HttpMethod,
  url: string,
  input: unknown,
): Promise<Output> {
  const handler = registry.get(key(method, url))
  if (!handler) {
    throw new Error(`[mock] нет обработчика для ${method} ${url}`)
  }
  await delay(MOCK_DELAY_MS)
  return handler(input) as Promise<Output>
}
