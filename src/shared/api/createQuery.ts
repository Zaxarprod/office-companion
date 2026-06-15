import { useQuery as useReactQuery, useQueryClient } from '@tanstack/react-query'
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import { request } from './request'

type QueryHookOptions<MappedOutput> = Omit<
  UseQueryOptions<MappedOutput, Error, MappedOutput>,
  'queryKey' | 'queryFn'
>

// void-вход → useQuery() без аргументов; иначе useQuery(input).
type QueryParams<Input, MappedOutput> = [Input] extends [void]
  ? [input?: undefined, options?: QueryHookOptions<MappedOutput>]
  : [input: Input, options?: QueryHookOptions<MappedOutput>]

export interface CreateQueryConfig<Input, Output, MappedOutput> {
  url: string
  method?: 'GET'
  transform: (output: Output) => MappedOutput
  /** Брать данные из реестра моков по URL вместо реального запроса. */
  mocked?: boolean
  getQueryKey?: (input: Input) => readonly unknown[]
}

export interface QueryFactory<Input, MappedOutput> {
  useQuery: (...args: QueryParams<Input, MappedOutput>) => UseQueryResult<MappedOutput, Error>
  useInvalidate: () => (input?: Input) => Promise<void>
}

export function createQuery<Input = void, Output = unknown, MappedOutput = Output>(
  config: CreateQueryConfig<Input, Output, MappedOutput>,
): QueryFactory<Input, MappedOutput> {
  const method = config.method ?? 'GET'
  const buildKey = (input: Input): readonly unknown[] =>
    config.getQueryKey?.(input) ?? [config.url, input]

  const useQuery = (...args: QueryParams<Input, MappedOutput>) => {
    const [input, options] = args as [Input, QueryHookOptions<MappedOutput>?]
    return useReactQuery<MappedOutput, Error, MappedOutput>({
      queryKey: buildKey(input) as unknown[],
      queryFn: async () => {
        const output = await request<Output, Input>({
          url: config.url,
          method,
          input,
          mocked: config.mocked,
        })
        return config.transform(output)
      },
      ...options,
    })
  }

  const useInvalidate = () => {
    const queryClient = useQueryClient()
    return (input?: Input) =>
      queryClient.invalidateQueries({
        queryKey: input === undefined ? [config.url] : (buildKey(input) as unknown[]),
      })
  }

  return { useQuery, useInvalidate }
}
