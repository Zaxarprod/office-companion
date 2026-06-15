import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { UpsellSheet } from '~/modules/subscription'
import { Nav } from '~/shared/ui'
import type { NavItem } from '~/shared/ui'

import styles from './TabsLayout.module.scss'

const tabs: NavItem<string>[] = [
  { value: '/', label: 'Главная', icon: 'home' },
  { value: '/tools', label: 'Функции', icon: 'layout-grid' },
  { value: '/profile', label: 'Профиль', icon: 'user' },
]

export const TabsLayout = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className={styles.shell}>
      <div className={styles.body}>
        <Outlet />
      </div>
      <div className={styles.navwrap}>
        <Nav
          items={tabs}
          value={pathname}
          onChange={(value) => navigate(value)}
        />
      </div>
      <UpsellSheet />
    </div>
  )
}
