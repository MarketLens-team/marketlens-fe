import clsx from 'clsx'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { SentimentGaugeBlock } from '../../data/types/dashboard'
import { SentimentArcGauge } from './SentimentArcGauge'
import styles from './PortfolioSentimentGauge.module.css'

interface PortfolioSentimentGaugeProps {
  gauge: SentimentGaugeBlock
  className?: string
}

export function PortfolioSentimentGauge({ gauge, className }: PortfolioSentimentGaugeProps) {
  return (
    <Card padding="md" className={clsx(styles.card, className)}>
      <CardSectionHeader title="내 포트폴리오 감성" variant="embedded" />
      <SentimentArcGauge
        chartId="portfolio-sentiment-gauge"
        gauge={gauge}
        ariaLabel={`포트폴리오 감성 ${gauge.score}`}
      />
    </Card>
  )
}
