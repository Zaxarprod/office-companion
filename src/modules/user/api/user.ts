import { createMutation, createQuery } from '~/shared/api'

import type { UpdateUserInput, User, UserDto } from '../types'

import { mapUser } from './mappers'

// Регистрируем моки этого слайса (side-effect).
import './mocks'

export const getMe = createQuery<void, UserDto, User>({
  url: '/me',
  method: 'GET',
  transform: mapUser,
})

export const updateMe = createMutation<UpdateUserInput, UserDto, User>({
  url: '/me',
  method: 'PATCH',
  transform: mapUser,
})
