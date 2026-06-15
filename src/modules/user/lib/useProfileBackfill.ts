import { getMe, updateMe } from '../api/user'
import type { UpdateUserInput } from '../types'

const isEmpty = (value: unknown): boolean => value == null || value === ''

/**
 * Дозаполнение профиля из функций: записываем только те поля, что сейчас пусты
 * в профиле (первое заполнение «побеждает», повторные использования не меняют
 * профиль). Профиль при этом предзаполняет инпуты функций — это отдельно, в самих
 * функциях через `getMe`.
 */
export const useProfileBackfill = () => {
  const { data: me } = getMe.useQuery()
  const invalidate = getMe.useInvalidate()
  const { mutate } = updateMe.useMutation({ onSuccess: () => invalidate() })

  return (patch: UpdateUserInput) => {
    if (!me) {
      return
    }
    const profile = me as Record<string, unknown>
    const next = Object.fromEntries(
      Object.entries(patch).filter(([key, value]) => !isEmpty(value) && isEmpty(profile[key])),
    ) as UpdateUserInput

    if (Object.keys(next).length > 0) {
      mutate(next)
    }
  }
}
