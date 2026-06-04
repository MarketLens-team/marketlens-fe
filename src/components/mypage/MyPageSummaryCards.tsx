import clsx from 'clsx'
import { Card } from '../common/Card'
import type { MyPageSummary } from '../../data/types/myPage'
import styles from './MyPageSummaryCards.module.css'

interface MyPageSummaryCardsProps {
  summary: MyPageSummary
}

export function MyPageSummaryCards({ summary }: MyPageSummaryCardsProps) {
  return (
    <Card padding="md" className={styles.card}>
      <div className={styles.grid} aria-label="마이페이지 요약">
        <article className={styles.item}>
          <p className={styles.label}>내 관심 종목</p>
          <p className={styles.value}>{summary.watchlistCount}</p>
          <p className={styles.hint}>최대 {summary.watchlistMax}개</p>
        </article>

        <article className={styles.item}>
          <p className={styles.label}>긍정 종목 비율</p>
          <p className={clsx(styles.value, styles.valuePos)}>{summary.positiveRatioPercent}%</p>
          <p className={styles.hint}>
            {summary.positiveCount} / {summary.watchlistCount} 종목
          </p>
        </article>

        <article className={styles.item}>
          <p className={styles.label}>주의 필요</p>
          <p
            className={clsx(
              styles.value,
              summary.needsAttentionCount > 0 ? styles.valueNeg : undefined,
            )}
          >
            {summary.needsAttentionCount}
          </p>
          <p className={styles.hint}>감성 -30 이하</p>
        </article>
      </div>
    </Card>
  )
}
