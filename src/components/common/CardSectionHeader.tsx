import clsx from 'clsx'
import styles from './CardSectionHeader.module.css'

export interface CardSectionHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function CardSectionHeader({ title, subtitle, className }: CardSectionHeaderProps) {
  return (
    <div className={clsx(styles.head, className)}>
      <h2 className={styles.title}>{title}</h2>
      {subtitle ? <p className={styles.sub}>{subtitle}</p> : null}
    </div>
  )
}
