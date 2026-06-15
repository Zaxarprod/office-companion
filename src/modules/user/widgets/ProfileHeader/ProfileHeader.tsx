import { EditableText, VStack } from '~/shared/ui'

import { getMe, updateMe } from '../../api/user'
import { UserAvatar } from '../UserAvatar'

export const ProfileHeader = () => {
  const { data } = getMe.useQuery()
  const invalidate = getMe.useInvalidate()
  const { mutate } = updateMe.useMutation({ onSuccess: () => invalidate() })

  return (
    <VStack gap={12} align='center'>
      <UserAvatar tone='onAccent' size={84} />
      <EditableText
        value={data?.name ?? ''}
        onSubmit={(name) => mutate({ name })}
        variant='heading'
        color='accent-fg'
        buttonVariant='onAccent'
      />
    </VStack>
  )
}
