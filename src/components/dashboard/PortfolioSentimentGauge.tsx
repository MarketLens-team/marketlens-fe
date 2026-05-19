import clsx from 'clsx'
import { useMemo } from 'react'
import GaugeChart from 'react-gauge-chart'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { SentimentGaugeBlock } from '../../data/types/dashboard'
import styles from './PortfolioSentimentGauge.module.css'

interface PortfolioSentimentGaugeProps {
  gauge: SentimentGaugeBlock
  className?: string
}

const GAUGE_ID = 'portfolio-sentiment-gauge'
const GAUGE_COLORS = ['#f6465d', '#f18a42', '#f0b429', '#79b852', '#02c076']
const ARCS_LENGTH = [0.2, 0.2, 0.2, 0.2, 0.2]
const ARC_WIDTH = 0.14
const GAUGE_CHART_STYLE = { width: '100%', height: 132 } as const

function scorePercent(score: number, min: number, max: number) {
  const range = max - min
  if (range <= 0) return 0.5
  return Math.min(1, Math.max(0, (score - min) / range))
}

function sentimentLabel(score: number): string {
  if (score <= -60) return '강한 부정'
  if (score <= -20) return '부정'
  if (score <= 20) return '중립'
  if (score <= 60) return '긍정'
  return '강한 긍정'
}

/** react-gauge-chart customNeedleComponent — percent에 맞춰 회전하는 아크 위 점 */
function GaugeArcDot({ percent }: { percent: number }) {
  const rotation = -90 + percent * 180

  return (
    <div className={styles.needlePivot} aria-hidden>
      <div className={styles.needleArm} style={{ transform: `rotate(${rotation}deg)` }}>
        <span className={styles.arcDot} />
      </div>
    </div>
  )
}

export function PortfolioSentimentGauge({ gauge, className }: PortfolioSentimentGaugeProps) {
  const percent = useMemo(
    () => scorePercent(gauge.score, gauge.min, gauge.max),
    [gauge.score, gauge.min, gauge.max],
  )
  const displayScore = String(gauge.score)
  const label = sentimentLabel(gauge.score)

  const centerText = useMemo(
    () => (
      <div className={styles.centerText}>
        <span className={styles.score}>{displayScore}</span>
        <span className={styles.label}>{label}</span>
      </div>
    ),
    [displayScore, label],
  )

  return (
    <Card padding="md" className={clsx(styles.card, className)}>
      <CardSectionHeader title="내 포트폴리오 감성" variant="embedded" showChevron />

      <div
        className={styles.gaugeWrap}
        role="img"
        aria-label={`포트폴리오 감성 ${displayScore}, ${label}`}
      >
        <GaugeChart
          id={GAUGE_ID}
          className={styles.gaugeChart}
          style={GAUGE_CHART_STYLE}
          arcsLength={ARCS_LENGTH}
          colors={GAUGE_COLORS}
          percent={percent}
          arcPadding={0.06}
          arcWidth={ARC_WIDTH}
          cornerRadius={6}
          marginInPercent={0.05}
          needleScale={0.55}
          hideText
          animate
          animDelay={0}
          animateDuration={1200}
          customNeedleComponent={<GaugeArcDot percent={percent} />}
          customNeedleComponentClassName={styles.needleLayer}
          customNeedleStyle={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          textComponent={centerText}
          textComponentContainerClassName={styles.textLayer}
        />
      </div>
    </Card>
  )
}
