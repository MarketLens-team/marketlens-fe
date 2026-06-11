import clsx from 'clsx'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { HelpTooltip } from '../ui/HelpTooltip'
import { useKospiIndex } from '../../hooks/useKospiIndex'
import type { SentimentGaugeBlock } from '../../data/types/dashboard'
import { getSentimentInterpretation } from '../stock/stockSentimentInterpretation'
import { formatPercent, priceChangeDirection } from '../stock/stockScore'
import { SentimentArcGauge } from './SentimentArcGauge'
import { sentimentLabel } from './sentimentGaugeShared'
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
  const { data: kospiIndex, loading: kospiLoading } = useKospiIndex()
  const changeDirection = kospiIndex ? priceChangeDirection(kospiIndex.changePercent) : 'flat'
  const changeClass =
    changeDirection === 'up'
      ? styles.changeUp
      : changeDirection === 'down'
        ? styles.changeDown
        : styles.changeFlat
  const moodLabel = sentimentLabel(gauge.score)

  const help = (
    <HelpTooltip label="KOSPI 지수·감성 점수" size="md">
      {kospiIndex != null ? (
        <p className={styles.indexLine}>
          <span>KOSPI {formatKospiIndexValue(kospiIndex.index)}</span>
          <span className={clsx(changeClass)}>{formatPercent(kospiIndex.changePercent)}</span>
        </p>
      ) : kospiLoading ? (
        <p className={styles.helpMeta}>지수를 불러오는 중…</p>
      ) : (
        <p className={styles.helpMeta}>지수 정보를 불러오지 못했습니다.</p>
      )}
      <p className={styles.helpNote}>
        현재 KOSPI 전체 감성 점수는 {gauge.score}점으로 {moodLabel} 상태입니다.
      </p>
      <p className={styles.helpDetail}>{getSentimentInterpretation(gauge.score)}</p>
    </HelpTooltip>
  )

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
