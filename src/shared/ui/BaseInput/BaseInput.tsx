import cn from 'classnames'

import { Field } from '~/shared/ui/Field'

import type { BaseInputProps } from './types'

import styles from './BaseInput.module.scss'

export function BaseInput({
  label,
  optional,
  error,
  pre,
  post,
  inputRef,
  ...inputProps
}: BaseInputProps) {
  return (
    <Field label={label} optional={optional} error={error}>
      <div className={cn(styles.input, error && styles.invalid)}>
        {pre && <span className={styles.pre}>{pre}</span>}
        <input ref={inputRef} className={styles.control} {...inputProps} />
        {post && <span className={styles.post}>{post}</span>}
      </div>
    </Field>
  )
}
