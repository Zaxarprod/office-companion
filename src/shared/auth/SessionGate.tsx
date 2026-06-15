import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { USE_MOCKS } from '~/shared/api'
import { ErrorScreen, IconBadge, ScreenLoader } from '~/shared/ui'

import { ensureSession } from './session'

type Status = 'loading' | 'ready' | 'error'

/** Поднимает сессию до рендера приложения. В режиме моков — пропускает. */
export const SessionGate = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<Status>(USE_MOCKS ? 'ready' : 'loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (USE_MOCKS) {
      return
    }
    let alive = true
    setStatus('loading')
    ensureSession()
      .then(() => alive && setStatus('ready'))
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
  }, [attempt])

  if (status === 'loading') {
    return <ScreenLoader />
  }

  if (status === 'error') {
    return (
      <ErrorScreen
        title='Не удалось войти'
        description='Похоже, бэкенд недоступен. Проверь, что сервер запущен.'
        image={<IconBadge icon='alert-triangle' tone='danger' shape='circle' size={72} iconSize={36} />}
        actionLabel='Повторить'
        onAction={() => setAttempt((value) => value + 1)}
      />
    )
  }

  return <>{children}</>
}
