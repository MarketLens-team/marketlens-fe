import clsx from 'clsx'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { HelpTooltip } from '../ui/HelpTooltip'
import { useKospiIndex } from '../../hooks/useKospiIndex'
import type { SentimentGaugeBlock } from '../../data/types/dashboard'
import { formatPercent, priceChangeDirection } from '../stock/stockScore'
import { SentimentArcGauge } from './SentimentArcGauge'
import styles from './DashboardKospiChip.module.css'

interface DashboardKospiChipProps {
  gauge: SentimentGaugeBlock
}

function formatKospiIndexValue(value: number): string {
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function DashboardKospiChip({ gauge }: DashboardKospiChipProps) {
  const { data: kospiIndex } = useKospiIndex()
  const changeDirection = kospiIndex ? priceChangeDirection(kospiIndex.changePercent) : 'flat'
  const changeClass =
    changeDirection === 'up'
      ? styles.changeUp
      : changeDirection === 'down'
        ? styles.changeDown
        : styles.changeFlat

  const help =
    kospiIndex != null ? (
      <HelpTooltip label="KOSPI 지수·등락률">
        <p className={styles.indexLine}>
          <span>KOSPI {formatKospiIndexValue(kospiIndex.index)}</span>
          <span className={clsx(changeClass)}>{formatPercent(kospiIndex.changePercent)}</span>
        </p>
        <p className={styles.helpNote}>게이지는 뉴스 감성 점수입니다.</p>
      </HelpTooltip>
    ) : undefined

  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader title="KOSPI 종합" subtitle="참고용" help={help} variant="embedded" />
      <SentimentArcGauge
        chartId="kospi-sentiment-gauge"
        gauge={gauge}
        ariaLabel={`KOSPI 종합 감성 ${gauge.score}`}
      />
    </Card>
  )
}
