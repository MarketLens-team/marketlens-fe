import clsx from 'clsx'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { SectorHeatmapCell } from '../../data/types/dashboard'
import {
  layoutSectorTreemap,
  sectorTreemapLayoutSize,
  type SectorTreemapLeaf,
} from './sectorTreemap'
import styles from './SectorHeatmapGrid.module.css'

interface SectorHeatmapGridProps {
  cells: SectorHeatmapCell[]
}

const TONE_RECT_CLASS = {
  positive: styles.cellRectPositive,
  negative: styles.cellRectNegative,
  neutral: styles.cellRectNeutral,
} as const

const TONE_SCORE_CLASS = {
  positive: styles.cellScoreOnFill,
  negative: styles.cellScoreOnFill,
  neutral: styles.cellScoreNeutral,
} as const

const TONE_LABEL_CLASS = {
  positive: styles.cellLabelOnFill,
  negative: styles.cellLabelOnFill,
  neutral: styles.cellLabelNeutral,
} as const

function SectorTreemapCell({ leaf }: { leaf: SectorTreemapLeaf }) {
  const { x, y, width, height, name, sentimentScore, mentionCount, sentimentTone, heatIntensity } =
    leaf
  const scoreText = `${sentimentScore > 0 ? '+' : ''}${sentimentScore}`
  const cx = x + width / 2
  const cy = y + height / 2
  const compact = width < 52 || height < 36
  const showScore = width >= 44 && height >= 32
  const showMentions = width >= 72 && height >= 52
  const nameSize = width < 72 ? 10 : width < 120 ? 11 : 12
  const scoreSize = width < 72 ? 11 : width < 120 ? 13 : 15
  const lineGap = showMentions ? 14 : 12
  const blockOffset = showMentions ? lineGap : lineGap / 2

  if (compact) {
    return (
      <g
        className={styles.cell}
        style={{ ['--heat' as string]: heatIntensity }}
        aria-label={`${name} 감성 ${scoreText}, 언급 ${mentionCount}건`}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={4}
          ry={4}
          className={clsx(styles.cellRect, TONE_RECT_CLASS[sentimentTone])}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          className={clsx(styles.cellNameCompact, TONE_LABEL_CLASS[sentimentTone])}
          fontSize={9}
        >
          {name}
        </text>
      </g>
    )
  }

  return (
    <g
      className={styles.cell}
      style={{ ['--heat' as string]: heatIntensity }}
      aria-label={`${name} 감성 ${scoreText}, 언급 ${mentionCount}건`}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        ry={4}
        className={clsx(styles.cellRect, TONE_RECT_CLASS[sentimentTone])}
      />
      <text
        x={cx}
        y={cy - blockOffset}
        textAnchor="middle"
        dominantBaseline="middle"
        className={clsx(styles.cellName, TONE_LABEL_CLASS[sentimentTone])}
        fontSize={nameSize}
      >
        {name}
      </text>
      {showScore ? (
        <text
          x={cx}
          y={cy + (showMentions ? 2 : blockOffset)}
          textAnchor="middle"
          dominantBaseline="middle"
          className={clsx(styles.cellScore, TONE_SCORE_CLASS[sentimentTone])}
          fontSize={scoreSize}
        >
          {scoreText}
        </text>
      ) : null}
      {showMentions ? (
        <text
          x={cx}
          y={cy + blockOffset + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className={clsx(styles.cellMentions, TONE_LABEL_CLASS[sentimentTone])}
          fontSize={10}
        >
          {mentionCount.toLocaleString('ko-KR')}건
        </text>
      ) : null}
    </g>
  )
}

export function SectorHeatmapGrid({ cells }: SectorHeatmapGridProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const el = chartRef.current
    if (!el) return

    const sync = () => {
      const { width, height } = el.getBoundingClientRect()
      setSize({ width: Math.floor(width), height: Math.floor(height) })
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const layoutSize = useMemo(
    () => sectorTreemapLayoutSize(size.width, size.height),
    [size.width, size.height],
  )

  const leaves = useMemo(
    () => layoutSectorTreemap(cells, layoutSize.width, layoutSize.height),
    [cells, layoutSize.width, layoutSize.height],
  )

  return (
    <Card padding="md" className={styles.card}>
      <div className={styles.head}>
        <CardSectionHeader
          title="섹터 감성 히트맵"
          subtitle="면적=언급량 · 색=감성"
          variant="embedded"
          className={styles.headerBlock}
        />
        <ul className={styles.legend} aria-label="감성 범례">
          <li className={styles.legendItem}>
            <span className={clsx(styles.legendSwatch, styles.legendSwatchPositive)} aria-hidden />
            긍정
          </li>
          <li className={styles.legendItem}>
            <span className={clsx(styles.legendSwatch, styles.legendSwatchNeutral)} aria-hidden />
            중립
          </li>
          <li className={styles.legendItem}>
            <span className={clsx(styles.legendSwatch, styles.legendSwatchNegative)} aria-hidden />
            부정
          </li>
        </ul>
      </div>
      <div ref={chartRef} className={styles.chartWrap} role="img" aria-label="섹터 감성 히트맵">
        {cells.length === 0 ? (
          <p className={styles.empty}>표시할 섹터 데이터가 없습니다.</p>
        ) : layoutSize.width > 0 && layoutSize.height > 0 ? (
          <svg
            className={styles.svg}
            width={layoutSize.width}
            height={layoutSize.height}
            viewBox={`0 0 ${layoutSize.width} ${layoutSize.height}`}
            aria-hidden
          >
            {leaves.map((leaf) => (
              <SectorTreemapCell key={leaf.name} leaf={leaf} />
            ))}
          </svg>
        ) : null}
      </div>
    </Card>
  )
}
