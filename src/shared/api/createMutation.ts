import { useMutation as useReactMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query'

import { request } from './request'

type MutationHookOptions<Input, MappedOutput> = Omit<
  UseMutationOptions<MappedOutput, Error, Input>,
  'mutationFn'
>

export interface CreateMutationConfig<Output, MappedOutput> {
  url: string
  method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  transform: (output: Output) => MappedOutput
  /** Брать данные из реестра моков по URL вместо реального запроса. */
  mocked?: boolean
}

export interface MutationFactory<Input, MappedOutput> {
  useMutation: (
    options?: MutationHookOptions<Input, MappedOutput>,
  ) => UseMutationResult<MappedOutput, Error, Input>
}

export function createMutation<Input = void, Output = unknown, MappedOutput = Output>(
  config: CreateMutationConfig<Output, MappedOutput>,
): MutationFactory<Input, MappedOutput> {
  const method = config.method ?? 'POST'

  const useMutation = (options?: MutationHookOptions<Input, MappedOutput>) =>
    useReactMutation<MappedOutput, Error, Input>({
      mutationFn: async (input: Input) => {
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

  return { useMutation }
}
