import { Layout } from '~/shared/ui/Layout'
import { VStack } from '~/shared/ui/Stack'

import { Loader } from './Loader'

/** Полноэкранное состояние загрузки (для standalone-флоу). */
export const ScreenLoader = () => (
  <Layout.Root standalone>
    <Layout.Body>
      <VStack align='center'>
        <Loader size={32} />
      </VStack>
    </Layout.Body>
  </Layout.Root>
)
