import { ProfileFields, ProfileHeader } from '~/modules/user'
import { Layout } from '~/shared/ui'

export const ProfilePage = () => (
  <Layout.Root>
    <Layout.Header variant='hero'>
      <ProfileHeader />
    </Layout.Header>
    <Layout.Body>
      <ProfileFields />
    </Layout.Body>
  </Layout.Root>
)
