import clsx from 'clsx'
import { Card } from '../common/Card'
import type { SentimentGaugeBlock } from '../../data/types/dashboard'
import styles from './PortfolioSentimentGauge.module.css'

interface PortfolioSentimentGaugeProps {
  gauge: SentimentGaugeBlock
  className?: string
}

const ARC_CX = 100
const ARC_CY = 88
const ARC_R = 74
const SEGMENT_COUNT = 5
/** 세그먼트 사이 여백(라운드 캡이 겹치지 않도록 충분히 큼) */
const GAP_RAD = 0.18

const SEGMENT_TONES = ['segDanger', 'segOrange', 'segNeutral', 'segGreen', 'segGreenStrong'] as const

function scorePercent(score: number, min: number, max: number) {
  const range = max - min
  if (range <= 0) return 0.5
  return Math.min(1, Math.max(0, (score - min) / range))
}

function sentimentLabel(score: number): string {
  if (score <= -30) return '강한 부정'
  if (score <= -10) return '부정'
  if (score <= 10) return '중립'
  if (score <= 30) return '긍정'
  return '강한 긍정'
}

function polarToXY(angle: number) {
  return {
    x: ARC_CX + ARC_R * Math.cos(angle),
    y: ARC_CY - ARC_R * Math.sin(angle),
  }
}

function arcPath(startAngle: number, endAngle: number) {
  const start = polarToXY(startAngle)
  const end = polarToXY(endAngle)
  const largeArc = startAngle - endAngle > Math.PI ? 1 : 0
  return `M ${start.x} ${start.y} A ${ARC_R} ${ARC_R} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

function buildSegments() {
  const span = (Math.PI - (SEGMENT_COUNT - 1) * GAP_RAD) / SEGMENT_COUNT
  const segments: { d: string; tone: (typeof SEGMENT_TONES)[number] }[] = []
  let cursor = Math.PI

  for (let i = 0; i < SEGMENT_COUNT; i += 1) {
    const end = cursor - span
    segments.push({ d: arcPath(cursor, end), tone: SEGMENT_TONES[i] })
    cursor = end - GAP_RAD
  }

  return segments
}

function indicatorPosition(percent: number) {
  const theta = Math.PI * (1 - percent)
  return polarToXY(theta)
}

const GAUGE_SEGMENTS = buildSegments()

export function PortfolioSentimentGauge({ gauge, className }: PortfolioSentimentGaugeProps) {
  const percent = scorePercent(gauge.score, gauge.min, gauge.max)
  const { x, y } = indicatorPosition(percent)
  const displayScore = gauge.score > 0 ? String(gauge.score) : String(gauge.score)
  const label = sentimentLabel(gauge.score)

  return (
    <Card padding="md" className={clsx(styles.card, className)}>
      <header className={styles.header}>
        <h2 className={styles.title}>내 포트폴리오 감성</h2>
        <span className={styles.chevron} aria-hidden>
          ›
        </span>
      </header>

      <div className={styles.gaugeWrap} role="img" aria-label={`포트폴리오 감성 ${displayScore}, ${label}`}>
        <svg className={styles.arc} viewBox="0 0 200 96" aria-hidden>
          {GAUGE_SEGMENTS.map((seg, i) => (
            <path key={i} className={clsx(styles.arcSegment, styles[seg.tone])} d={seg.d} />
          ))}
          <circle className={styles.indicator} cx={x} cy={y} r="6" />
        </svg>
        <div className={styles.center}>
          <span className={styles.score}>{displayScore}</span>
          <span className={styles.label}>{label}</span>
        </div>
      </div>
    </Card>
  )
}
