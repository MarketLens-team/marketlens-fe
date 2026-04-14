import styles from './CardSectionHeader.module.css'

export interface CardSectionHeaderProps {
  title: string
  subtitle?: string
}

export function CardSectionHeader({ title, subtitle }: CardSectionHeaderProps) {
  return (
    <div className={styles.head}>
      <h2 className={styles.title}>{title}</h2>
      {subtitle ? <p className={styles.sub}>{subtitle}</p> : null}
    </div>
  )
}
