import cn from 'classnames'
import { useSyncExternalStore } from 'react'

import type { IconName } from '~/shared/ui/Icon'
import { IconBadge } from '~/shared/ui/IconBadge'
import type { IconBadgeTone } from '~/shared/ui/IconBadge'
import { VStack } from '~/shared/ui/Stack'
import { Text } from '~/shared/ui/Text'

import { notificationStore, notificationsSnapshot, notificationsSubscribe } from './store'
import type { NotificationType } from './store'

import styles from './Notifications.module.scss'

const TONE: Record<NotificationType, IconBadgeTone> = {
  success: 'sage',
  error: 'danger',
  warning: 'gold',
}

const ICON: Record<NotificationType, IconName> = {
  success: 'check-circle',
  error: 'alert-triangle',
  warning: 'info',
}

/** Стек всплывающих тостов сверху. Монтируется один раз в корне приложения. */
export const Notifications = () => {
  const items = useSyncExternalStore(
    notificationsSubscribe,
    notificationsSnapshot,
    notificationsSnapshot,
  )

  return (
    <div className={styles.wrap}>
      {items.map((item) => (
        <button
          key={item.id}
          type='button'
          className={cn(styles.toast, styles[item.type])}
          onClick={() => notificationStore.dismiss(item.id)}
        >
          <IconBadge
            icon={item.iconName ?? ICON[item.type]}
            tone={TONE[item.type]}
            shape='circle'
            size={34}
            iconSize={18}
          />
          <VStack gap={1} grow={1}>
            <Text variant='subhead'>{item.title}</Text>
            {item.subTitle && (
              <Text variant='small' color='ink-soft'>
                {item.subTitle}
              </Text>
            )}
          </VStack>
        </button>
      ))}
    </div>
  )
}
