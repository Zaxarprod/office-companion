import type { User, UserDto } from '../types'

export const mapUser = (dto: UserDto): User => ({
  ...dto,
  birthday: dto.birthday ? new Date(dto.birthday) : undefined,
})
