import { useNavigate } from 'react-router-dom'

import { CheckInPrompt, DailyMetrics } from '~/modules/checkIn'
import { ToolsGrid } from '~/modules/tools'
import { UserAvatar, UserGreeting } from '~/modules/user'
import { HStack, Layout, Section, Text, VStack } from '~/shared/ui'

export const HomePage = () => {
  const navigate = useNavigate()

  return (
    <Layout.Root>
      <Layout.Header spacing={14}>
        <HStack justify='between' align='center'>
          <Text variant='heading' color='accent-fg'>
            Держимся
          </Text>
          <UserAvatar tone='onAccent' onClick={() => navigate('/profile')} />
        </HStack>
        <UserGreeting />
        <VStack gap={14}>
          <CheckInPrompt />
          <DailyMetrics />
        </VStack>
      </Layout.Header>

      <Layout.Body>
        <Section title='Инструменты'>
          <ToolsGrid scope='home' />
        </Section>
      </Layout.Body>
    </Layout.Root>
  )
}
