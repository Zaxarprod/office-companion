import { ToolsGrid } from '~/modules/tools'
import { HStack, IconButton, Layout, Section, Text } from '~/shared/ui'

export const ToolsPage = () => (
  <Layout.Root>
    <Layout.Header variant='bar'>
      <HStack justify='between' align='center'>
        <Text variant='display' as='h1'>
          Функции
        </Text>
        <IconButton icon='search' label='Поиск' />
      </HStack>
    </Layout.Header>

    <Layout.Body>
      <Section title='Всё, чем можно пользоваться'>
        <ToolsGrid scope='all' />
      </Section>
    </Layout.Body>
  </Layout.Root>
)
