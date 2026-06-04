import clsx from 'clsx'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import { computeGaugeArcDotPosition } from './gaugeArcDotLayout'
import styles from './SentimentArcGauge.module.css'

const GAUGE_MARGIN_IN_PERCENT = 0.05

/** truthy여야 라이브러리 기본 SVG 바늘이 그려지지 않음 */
const HIDDEN_NEEDLE = <span aria-hidden className={styles.needleHidden} />

interface SentimentArcGaugeProps {
  chartId: string
  gauge: SentimentGaugeBlock
  className?: string
  ariaLabel?: string
}

export function SentimentArcGauge({ chartId, gauge, className, ariaLabel }: SentimentArcGaugeProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [dotPosition, setDotPosition] = useState<{ left: number; top: number } | null>(null)

  const percent = useMemo(
    () => scorePercent(gauge.score, gauge.min, gauge.max),
    [gauge.score, gauge.min, gauge.max],
  )
  const displayScore = String(gauge.score)
  const label = sentimentLabel(gauge.score)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const syncDot = () => {
      const { width, height } = el.getBoundingClientRect()
      setDotPosition(
        computeGaugeArcDotPosition(width, height, {
          marginInPercent: GAUGE_MARGIN_IN_PERCENT,
          arcWidth: GAUGE_ARC_WIDTH,
          percent,
        }),
      )
    }

    syncDot()
    const observer = new ResizeObserver(syncDot)
    observer.observe(el)
    return () => observer.disconnect()
  }, [percent])

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
      ref={wrapRef}
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
        marginInPercent={GAUGE_MARGIN_IN_PERCENT}
        customNeedleComponent={HIDDEN_NEEDLE}
        customNeedleComponentClassName={styles.needleLayer}
        customNeedleStyle={{ display: 'none' }}
        hideText
        animate
        animDelay={0}
        animateDuration={1200}
        textComponent={centerText}
        textComponentContainerClassName={styles.textLayer}
      />
      {dotPosition ? (
        <span
          className={styles.arcDot}
          style={{ left: dotPosition.left, top: dotPosition.top }}
          aria-hidden
        />
      ) : null}
    </div>
  )
}
