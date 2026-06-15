import { registerMock } from '~/shared/api'

import type { UpdateUserInput, UserDto } from '../types'

let currentUser: UserDto = {
  id: 'u1',
  name: 'Алиса',
  birthday: '1996-09-14',
  birthTime: '09:25',
  country: 'Россия',
  city: 'Москва',
  profession: 'Frontend-разработчик',
  grade: 'senior',
  experienceYears: 4,
  experienceMonths: 6,
  isPro: false,
}

registerMock<void, UserDto>('GET', '/me', () => currentUser)

// PATCH /me — мутируем мок, чтобы updateMe отражался при рефетче.
registerMock<UpdateUserInput, UserDto>('PATCH', '/me', (input) => {
  currentUser = {
    ...currentUser,
    ...input,
    birthday: input.birthday ? input.birthday.toISOString() : currentUser.birthday,
  }
  return currentUser
})
