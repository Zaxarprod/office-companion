import cn from 'classnames'

import { Shapes } from './Shapes'
import type { LayoutRootProps } from './types'

import styles from './Layout.module.scss'

export const Root = ({ children, shapeVariant, shapeColor, standalone }: LayoutRootProps) => (
  <div className={cn(styles.root, standalone && styles.standalone)}>
    {shapeVariant ? <Shapes variant={shapeVariant} color={shapeColor} /> : null}
    <div className={styles.content}>{children}</div>
  </div>
)
