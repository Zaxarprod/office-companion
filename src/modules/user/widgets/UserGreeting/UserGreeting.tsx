import { Text } from '~/shared/ui'

import { getMe } from '../../api/user'

export const UserGreeting = () => {
  const { data } = getMe.useQuery()

  return (
    <Text variant='display' as='h1' color='accent-fg'>
      Привет,
      <br />
      {data?.name ?? '…'}
    </Text>
  )
}
