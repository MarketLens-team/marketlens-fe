import clsx from 'clsx'
import type { BuzzSurgeSummary } from '../../data/types/buzzSurge'
import { formatStockScore } from './buzzSurgeScore'
import styles from './BuzzSurgeSummaryCards.module.css'

interface BuzzSurgeSummaryCardsProps {
  summary: BuzzSurgeSummary
}

export function BuzzSurgeSummaryCards({ summary }: BuzzSurgeSummaryCardsProps) {
  const avgTone =
    summary.avgSentiment > 0 ? styles.valuePos : summary.avgSentiment < 0 ? styles.valueNeg : styles.valueNeutral

  return (
    <div className={styles.stack} aria-label="언급량 급등 요약">
      <article className={styles.card}>
        <p className={styles.label}>최대 급등</p>
        <p className={styles.value}>
          {summary.topMoverName}
          <span className={styles.valueSurge}>+{summary.topMoverSurgePercent}%</span>
        </p>
      </article>

      <article className={styles.card}>
        <p className={styles.label}>평균 감성</p>
        <p className={clsx(styles.value, avgTone)}>{formatStockScore(summary.avgSentiment)}</p>
        <p className={styles.sub}>
          {summary.avgSentiment > 0 ? '긍정 우세' : summary.avgSentiment < 0 ? '부정 우세' : '중립'}
        </p>
      </article>

      <article className={styles.card}>
        <p className={styles.label}>오늘 뉴스</p>
        <p className={styles.value}>
          {summary.newsCount.toLocaleString('ko-KR')}
          <span className={styles.valueUnit}>건</span>
        </p>
      </article>
    </div>
  )
}
