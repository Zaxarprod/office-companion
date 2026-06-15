import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

import type { FieldProps } from '~/shared/ui/Field'

type NativeInputProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'value'
  | 'onChange'
  | 'onFocus'
  | 'onBlur'
  | 'placeholder'
  | 'type'
  | 'inputMode'
  | 'disabled'
  | 'name'
  | 'autoComplete'
  | 'maxLength'
  | 'onKeyDown'
  | 'autoFocus'
>

export interface BaseInputProps extends FieldProps, NativeInputProps {
  /** Контент слева внутри поля (флаг, символ). */
  pre?: ReactNode
  /** Контент справа внутри поля (иконка, единица). */
  post?: ReactNode
  inputRef?: Ref<HTMLInputElement>
}
