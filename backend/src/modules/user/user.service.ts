import type { UpdateUserInput } from '@contracts/user'

import { prisma } from '../../prisma'

export const userService = {
  getMe: (id: string) => prisma.user.findUniqueOrThrow({ where: { id } }),

  updateMe: (id: string, input: UpdateUserInput) =>
    prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        avatarUrl: input.avatarUrl,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
        birthTime: input.birthTime,
        country: input.country,
        city: input.city,
        profession: input.profession,
        grade: input.grade,
        experienceYears: input.experienceYears,
        experienceMonths: input.experienceMonths,
      },
    }),
}
