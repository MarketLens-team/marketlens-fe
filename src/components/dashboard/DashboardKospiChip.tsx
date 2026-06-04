import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { SentimentGaugeBlock } from '../../data/types/dashboard'
import { SentimentArcGauge } from './SentimentArcGauge'
import styles from './DashboardKospiChip.module.css'

interface DashboardKospiChipProps {
  gauge: SentimentGaugeBlock
}

export function DashboardKospiChip({ gauge }: DashboardKospiChipProps) {
  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader title="KOSPI 종합" subtitle="참고용" variant="embedded" />
      <SentimentArcGauge
        chartId="kospi-sentiment-gauge"
        gauge={gauge}
        ariaLabel={`KOSPI 종합 감성 ${gauge.score}`}
      />
    </Card>
  )
}
