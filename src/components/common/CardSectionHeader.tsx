import clsx from 'clsx'
import styles from './CardSectionHeader.module.css'

export interface CardSectionHeaderProps {
  title: string
  subtitle?: string
  className?: string
  /** `embedded`: Card 내부 패딩만 쓰고 상단 좌측 정렬(대시보드 카드). `section`: 구분선·자체 패딩(기본) */
  variant?: 'section' | 'embedded'
  showChevron?: boolean
  align?: 'start' | 'center'
}

export function CardSectionHeader({
  title,
  subtitle,
  className,
  variant = 'section',
  showChevron = false,
  align = 'start',
}: CardSectionHeaderProps) {
  return (
    <div
      className={clsx(
        styles.head,
        variant === 'embedded' && styles.headEmbedded,
        align === 'center' && styles.alignCenter,
        className,
      )}
    >
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{title}</h2>
        {showChevron ? (
          <span className={styles.chevron} aria-hidden>
            ›
          </span>
        ) : null}
      </div>
      {subtitle ? <p className={styles.sub}>{subtitle}</p> : null}
    </div>
  )
}
