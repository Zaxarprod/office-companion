import type { User } from '@prisma/client'

import type { UserDto } from '@contracts/user'

export const toUserDto = (user: User): UserDto => ({
  id: user.id,
  name: user.name,
  avatarUrl: user.avatarUrl ?? undefined,
  birthday: user.birthday?.toISOString(),
  birthTime: user.birthTime ?? undefined,
  country: user.country ?? undefined,
  city: user.city ?? undefined,
  birthCity: user.birthCity ?? undefined,
  profession: user.profession ?? undefined,
  grade: user.grade ?? undefined,
  experienceYears: user.experienceYears ?? undefined,
  experienceMonths: user.experienceMonths ?? undefined,
  isPro: user.isPro,
})
