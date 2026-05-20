import clsx from 'clsx'
import type { MyPageSummary } from '../../data/types/myPage'
import styles from './MyPageSummaryCards.module.css'

interface MyPageSummaryCardsProps {
  summary: MyPageSummary
}

export function MyPageSummaryCards({ summary }: MyPageSummaryCardsProps) {
  return (
    <section className={styles.grid} aria-label="마이페이지 요약">
      <article className={styles.card}>
        <p className={styles.label}>내 관심 종목</p>
        <p className={styles.value}>{summary.watchlistCount}</p>
        <p className={styles.sub}>최대 {summary.watchlistMax}개</p>
      </article>

      <article className={styles.card}>
        <p className={styles.label}>긍정 종목 비율</p>
        <p className={clsx(styles.value, styles.valuePos)}>{summary.positiveRatioPercent}%</p>
        <p className={styles.sub}>
          {summary.positiveCount} / {summary.watchlistCount} 종목
        </p>
      </article>

      <article className={styles.card}>
        <p className={styles.label}>주의 필요</p>
        <p className={clsx(styles.value, styles.valueNeg)}>{summary.needsAttentionCount}</p>
        <p className={styles.sub}>감성 -30 이하</p>
      </article>
    </section>
  )
}
