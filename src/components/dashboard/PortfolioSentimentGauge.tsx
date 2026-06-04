import clsx from 'clsx'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { useAuthStore } from '../../store/authStore'
import type { SentimentGaugeBlock } from '../../data/types/dashboard'
import { DashboardLoginPrompt } from './DashboardLoginPrompt'
import { SentimentArcGauge } from './SentimentArcGauge'
import styles from './PortfolioSentimentGauge.module.css'

interface PortfolioSentimentGaugeProps {
  gauge: SentimentGaugeBlock
  className?: string
}

export function PortfolioSentimentGauge({ gauge, className }: PortfolioSentimentGaugeProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  return (
    <Card padding="md" className={clsx(styles.card, className)}>
      <CardSectionHeader title="내 포트폴리오 감성" variant="embedded" />
      {isLoggedIn ? (
        <SentimentArcGauge
          chartId="portfolio-sentiment-gauge"
          gauge={gauge}
          ariaLabel={`포트폴리오 감성 ${gauge.score}`}
        />
      ) : (
        <DashboardLoginPrompt
          compact
          title="로그인이 필요해요"
          message="로그인하면 관심 종목 기준 포트폴리오 감성을 볼 수 있어요."
        />
      )}
    </Card>
  )
}
