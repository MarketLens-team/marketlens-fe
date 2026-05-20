import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { SectorHeatmapCell } from '../../data/types/dashboard'
import {
  layoutSectorTreemap,
  sentimentFill,
  sentimentScoreColor,
} from './sectorTreemap'
import styles from './SectorHeatmapGrid.module.css'

interface SectorHeatmapGridProps {
  cells: SectorHeatmapCell[]
}

interface SectorTreemapCellProps {
  leaf: ReturnType<typeof layoutSectorTreemap>[number]
}

function SectorTreemapCell({ leaf }: SectorTreemapCellProps) {
  const { x, y, width, height, name, sentimentScore, mentionCount } = leaf
  const scoreText = `${sentimentScore > 0 ? '+' : ''}${sentimentScore}`
  const showDetail = width >= 52 && height >= 44
  const showMentions = width >= 52 && height >= 60
  const cx = x + width / 2
  const nameY = y + height / 2 - (showMentions ? 10 : showDetail ? 4 : 0)
  const scoreY = y + height / 2 + (showMentions ? 6 : 10)
  const mentionY = y + height / 2 + 22

  return (
    <g aria-label={`${name} 감성 ${scoreText}, 언급 ${mentionCount}건`}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        ry={6}
        fill={sentimentFill(sentimentScore)}
      />
      {showDetail ? (
        <>
          <text
            x={cx}
            y={nameY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize={width < 72 ? 10 : 11}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={cx}
            y={scoreY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={sentimentScoreColor(sentimentScore)}
            fontSize={width < 72 ? 12 : 14}
            fontWeight={700}
            fontFamily="var(--font-mono)"
          >
            {scoreText}
          </text>
          {showMentions ? (
            <text
              x={cx}
              y={mentionY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#d8e2ee"
              fontSize={10}
              fontWeight={500}
            >
              {mentionCount}건
            </text>
          ) : null}
        </>
      ) : (
        <text
          x={cx}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize={9}
          fontWeight={600}
        >
          {name}
        </text>
      )}
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

  const leaves = useMemo(
    () => layoutSectorTreemap(cells, size.width, size.height),
    [cells, size.width, size.height],
  )

  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader
        title="섹터 감성 히트맵"
        subtitle="섹터별 감성 · 언급 건수"
        variant="embedded"
        showChevron
      />
      <div ref={chartRef} className={styles.chartWrap} role="img" aria-label="섹터 감성 히트맵">
        {size.width > 0 && size.height > 0 ? (
          <svg
            className={styles.svg}
            width={size.width}
            height={size.height}
            viewBox={`0 0 ${size.width} ${size.height}`}
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
