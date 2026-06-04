import clsx from 'clsx'
import { useMemo } from 'react'
import GaugeChart from 'react-gauge-chart'
import type { SentimentGaugeBlock } from '../../data/types/dashboard'
import {
  GAUGE_ARCS_LENGTH,
  GAUGE_ARC_WIDTH,
  GAUGE_CHART_STYLE,
  GAUGE_COLORS,
  scorePercent,
  sentimentLabel,
} from './sentimentGaugeShared'
import styles from './SentimentArcGauge.module.css'

interface SentimentArcGaugeProps {
  chartId: string
  gauge: SentimentGaugeBlock
  className?: string
  ariaLabel?: string
}

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

export function SentimentArcGauge({ chartId, gauge, className, ariaLabel }: SentimentArcGaugeProps) {
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
    <div
      className={clsx(styles.gaugeWrap, className)}
      role="img"
      aria-label={ariaLabel ?? `감성 ${displayScore}, ${label}`}
    >
      <GaugeChart
        id={chartId}
        className={styles.gaugeChart}
        style={GAUGE_CHART_STYLE}
        arcsLength={GAUGE_ARCS_LENGTH}
        colors={GAUGE_COLORS}
        percent={percent}
        arcPadding={0.06}
        arcWidth={GAUGE_ARC_WIDTH}
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
  )
}
