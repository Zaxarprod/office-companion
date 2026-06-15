import cn from 'classnames'
import { motion } from 'motion/react'

import { Icon } from '~/shared/ui/Icon'

import type { NavProps, NavValue } from './types'

import styles from './Nav.module.scss'

// Поп иконки при активации (как в Telegram): запускается при смене варианта.
const iconVariants = {
  idle: { scale: 1 },
  active: { scale: [1, 1.28, 1] },
}

export function Nav<T extends NavValue>({ items, value, onChange }: NavProps<T>) {
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  )
  const itemWidth = 100 / items.length

  return (
    <div className={styles.nav}>
      <div className={styles.inner}>
        {/* Индикатор скользит по left внутри стабильного контейнера (CSS-transition),
            не зависит от ре-флоу страницы — поэтому не «прыгает» при загрузке данных. */}
        <span
          className={styles.indicator}
          style={{ width: `${itemWidth}%`, left: `${activeIndex * itemWidth}%` }}
        />
        {items.map((item) => {
          const active = item.value === value
          return (
            <button
              key={item.value}
              type='button'
              className={cn(styles.item, active && styles.itemActive)}
              onClick={() => onChange(item.value)}
            >
              <motion.span
                className={styles.icon}
                variants={iconVariants}
                animate={active ? 'active' : 'idle'}
                transition={{ duration: 0.3 }}
              >
                <Icon name={item.icon} size={20} />
              </motion.span>
              <span className={styles.label}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
