import cn from 'classnames'

import { getMe } from '../../api/user'

import styles from './UserAvatar.module.scss'

export interface UserAvatarProps {
  /** onAccent — поверх акцентного hero; surface — на светлом фоне. */
  tone?: 'onAccent' | 'surface'
  size?: number
  /** Если передан — аватар кликабельный (кнопка). */
  onClick?: () => void
}

export const UserAvatar = ({ tone = 'surface', size = 36, onClick }: UserAvatarProps) => {
  const { data } = getMe.useQuery()
  const initial = data?.name?.[0]?.toUpperCase() ?? ''
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) }

  if (onClick) {
    return (
      <button
        type='button'
        aria-label='Профиль'
        className={cn(styles.avatar, styles[tone], styles.button)}
        style={style}
        onClick={onClick}
      >
        {initial}
      </button>
    )
  }

  return (
    <span className={cn(styles.avatar, styles[tone])} style={style}>
      {initial}
    </span>
  )
}
