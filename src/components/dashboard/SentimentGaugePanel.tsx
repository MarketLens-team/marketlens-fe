import clsx from 'clsx'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { SentimentGaugeBlock, SentimentDistribution, StockHighlight } from '../../data/types/dashboard'
import styles from './SentimentGaugePanel.module.css'

interface SentimentGaugePanelProps {
  title: string
  subtitle?: string
  gauge: SentimentGaugeBlock
  stocksToWatch?: StockHighlight[]
}

function scoreTone(score: number): 'pos' | 'neg' | 'neu' {
  if (score > 0) return 'pos'
  if (score < 0) return 'neg'
  return 'neu'
}

function DistributionBar({ distribution }: { distribution: SentimentDistribution }) {
  const { positive, neutral, negative } = distribution
  return (
    <div className={styles.distWrap} aria-label="감성 분포">
      <div className={styles.distBar}>
        <span className={styles.distPos} style={{ width: `${positive}%` }} />
        <span className={styles.distNeu} style={{ width: `${neutral}%` }} />
        <span className={styles.distNeg} style={{ width: `${negative}%` }} />
      </div>
      <ul className={styles.distLegend}>
        <li>긍정 {positive}%</li>
        <li>중립 {neutral}%</li>
        <li>부정 {negative}%</li>
      </ul>
    </div>
  )
}

export function SentimentGaugePanel({ title, subtitle, gauge, stocksToWatch }: SentimentGaugePanelProps) {
  const tone = scoreTone(gauge.score)
  const range = gauge.max - gauge.min
  const fillPct = range > 0 ? ((gauge.score - gauge.min) / range) * 100 : 50

  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader title={title} subtitle={subtitle} variant="embedded" showChevron />
      <div className={styles.body}>
        <div className={styles.gaugeCol} aria-hidden>
          <div className={styles.gaugeTrack}>
            <div className={styles.gaugeFill} style={{ width: `${fillPct}%` }} />
          </div>
          <p className={clsx(styles.score, styles[tone])}>
            {gauge.score > 0 ? '+' : ''}
            {gauge.score}
          </p>
          <p className={styles.range}>
            {gauge.min} ~ {gauge.max}
          </p>
        </div>
        <DistributionBar distribution={gauge.distribution} />
      </div>
      {stocksToWatch?.length ? (
        <div className={styles.watchBlock}>
          <h3 className={styles.watchTitle}>주목할 종목</h3>
          <ul className={styles.watchList}>
            {stocksToWatch.map((s) => (
              <li key={s.name} className={styles.watchItem}>
                <span className={styles.watchName}>{s.name}</span>
                <span className={clsx(styles.watchMetric, styles[`watch_${s.tone}`])}>
                  {s.metricLabel} {s.metricValue}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  )
}
