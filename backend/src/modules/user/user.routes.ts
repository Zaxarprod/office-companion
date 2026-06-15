import type { FastifyInstance } from 'fastify'

import type { UpdateUserInput, UserDto } from '@contracts/user'

import { toUserDto } from './user.mapper'
import { userService } from './user.service'

export const userRoutes = async (app: FastifyInstance) => {
  app.get('/me', { preHandler: app.authenticate }, async (request): Promise<UserDto> => {
    const user = await userService.getMe(request.userId)
    return toUserDto(user)
  })

  app.patch('/me', { preHandler: app.authenticate }, async (request): Promise<UserDto> => {
    const user = await userService.updateMe(request.userId, request.body as UpdateUserInput)
    return toUserDto(user)
  })
}
