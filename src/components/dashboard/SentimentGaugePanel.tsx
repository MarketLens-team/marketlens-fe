import clsx from 'clsx'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { SentimentGaugeBlock, StockHighlight } from '../../data/types/dashboard'
import { SentimentArcGauge } from './SentimentArcGauge'
import styles from './SentimentGaugePanel.module.css'

interface SentimentGaugePanelProps {
  title: string
  subtitle?: string
  gauge: SentimentGaugeBlock
  stocksToWatch?: StockHighlight[]
}

export function SentimentGaugePanel({ title, subtitle, gauge, stocksToWatch }: SentimentGaugePanelProps) {
  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader title={title} subtitle={subtitle} variant="embedded" showChevron />
      <div className={styles.gaugeBody}>
        <SentimentArcGauge chartId="kospi-sentiment-gauge" gauge={gauge} ariaLabel={`${title} ${gauge.score}`} />
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
