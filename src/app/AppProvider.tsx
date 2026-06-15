import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ServerErrorPage } from '~/pages/error'
import { queryClient } from '~/shared/api'
import { SessionGate } from '~/shared/auth'
import { ErrorBoundary, Notifications } from '~/shared/ui'

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary fallback={<ServerErrorPage />}>
        <SessionGate>{children}</SessionGate>
      </ErrorBoundary>
      <Notifications />
    </QueryClientProvider>
  )
}
