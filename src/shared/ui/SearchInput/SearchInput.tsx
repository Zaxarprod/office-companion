import { Icon } from '~/shared/ui/Icon'

import type { SearchInputProps } from './types'

import styles from './SearchInput.module.scss'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Поиск',
  autoFocus,
}: SearchInputProps) {
  return (
    <label className={styles.search}>
      <Icon name='search' size={16} color='ink-faint' />
      <input
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    </label>
  )
}
