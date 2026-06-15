import styles from './Loader.module.scss'

export interface LoaderProps {
  size?: number
}

export const Loader = ({ size = 28 }: LoaderProps) => (
  <span className={styles.loader} style={{ width: size, height: size }} aria-label='Загрузка' />
)
