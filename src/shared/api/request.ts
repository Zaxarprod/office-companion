import { API_BASE_URL, USE_MOCKS } from './config'
import { resolveMock } from './mock/registry'
import { getToken } from './token'
import type { RequestArgs } from './types'

const toQueryString = (input: unknown): string => {
  if (!input || typeof input !== 'object') {
    return ''
  }
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value))
    }
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function request<Output, Input = unknown>({
  url,
  method,
  input,
  mocked,
}: RequestArgs<Input>): Promise<Output> {
  // USE_MOCKS — глобальный офлайн-режим; mocked — ручка ещё без реального бэка.
  if (USE_MOCKS || mocked) {
    return resolveMock<Output>(method, url, input)
  }

  const isGet = method === 'GET'
  const finalUrl = API_BASE_URL + url + (isGet ? toQueryString(input) : '')

  const headers: Record<string, string> = {}
  if (!isGet) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(finalUrl, {
    method,
    headers,
    body: isGet || input === undefined ? undefined : JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`[api] ${method} ${url} → ${response.status}`)
  }

  return response.json() as Promise<Output>
}
