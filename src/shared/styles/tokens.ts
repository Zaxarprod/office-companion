// Типы токенов для пропсов компонентов. Значения живут в theme.scss (CSS-vars).

export type ColorToken =
  | 'bg'
  | 'card'
  | 'ink'
  | 'ink-soft'
  | 'ink-faint'
  | 'accent'
  | 'accent-fg'
  | 'gold'
  | 'ochre'
  | 'coral'
  | 'sage'
  | 'danger'
  | 'moon'
  | 'heart'

export type RadiusToken = 'sm' | 'md' | 'lg' | 'xl' | 'pill'

export type TypographyVariant =
  | 'mega'
  | 'display'
  | 'heading'
  | 'subhead'
  | 'body'
  | 'caption'
  | 'small'
  | 'label'
  | 'micro'
  | 'numeric'

export const colorVar = (token: ColorToken): string => `var(--${token})`

export const radiusVar = (token: RadiusToken): string => `var(--r-${token})`
