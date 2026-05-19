import { useMemo } from 'react'
import { ResponsiveContainer, Treemap } from 'recharts'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { SectorHeatmapCell } from '../../data/types/dashboard'
import styles from './SectorHeatmapGrid.module.css'

interface SectorHeatmapGridProps {
  cells: SectorHeatmapCell[]
}

interface SectorTreemapNode {
  name: string
  size: number
  sentimentScore: number
  mentionCount: number
}

type TreemapContentProps = SectorTreemapNode & {
  x: number
  y: number
  width: number
  height: number
  depth: number
  index: number
}

function sectorFill(score: number): string {
  if (score > 15) return '#1d7a5c'
  if (score < -5) return '#9a3a4d'
  return '#3d5268'
}

function scoreColor(score: number): string {
  if (score > 0) return '#7dffc4'
  if (score < 0) return '#ffb3be'
  return '#e8f0f8'
}

function TreemapSectorCell(props: Record<string, unknown>) {
  return <SectorTreemapContent {...(props as unknown as TreemapContentProps)} />
}

function SectorTreemapContent(props: TreemapContentProps) {
  const { x, y, width, height, name, sentimentScore = 0, mentionCount = 0 } = props

  if (!name || width < 24 || height < 20) {
    return null
  }

  const fill = sectorFill(sentimentScore)
  const showDetail = width >= 48 && height >= 40
  const showMentions = width >= 48 && height >= 56
  const scoreText = `${sentimentScore > 0 ? '+' : ''}${sentimentScore}`

  return (
    <g aria-label={`${name} 감성 ${scoreText}, 언급 ${mentionCount}건`}>
      <rect
        x={x + 1}
        y={y + 1}
        width={Math.max(0, width - 2)}
        height={Math.max(0, height - 2)}
        rx={6}
        ry={6}
        fill={fill}
        stroke="#4d6478"
        strokeWidth={1.5}
      />
      {showDetail ? (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - (showMentions ? 8 : 0)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize={width < 64 ? 10 : 11}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + (showMentions ? 8 : 12)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={scoreColor(sentimentScore)}
            fontSize={width < 64 ? 12 : 14}
            fontWeight={700}
            fontFamily="IBM Plex Mono, monospace"
          >
            {scoreText}
          </text>
          {showMentions ? (
            <text
              x={x + width / 2}
              y={y + height / 2 + 26}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#d0dae6"
              fontSize={10}
              fontWeight={500}
            >
              {mentionCount}건
            </text>
          ) : null}
        </>
      ) : (
        <text
          x={x + width / 2}
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
  const treeData = useMemo(
    () =>
      cells.map((cell) => ({
        name: cell.name,
        size: cell.mentionCount,
        sentimentScore: cell.sentimentScore,
        mentionCount: cell.mentionCount,
      })),
    [cells],
  )

  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader
        title="섹터 감성 히트맵"
        subtitle="섹터별 감성 · 언급 건수"
        variant="embedded"
        showChevron
      />
      <div className={styles.chartWrap} role="img" aria-label="섹터 감성 히트맵">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treeData}
            dataKey="size"
            nameKey="name"
            aspectRatio={4 / 3}
            stroke="#4d6478"
            isAnimationActive={false}
            content={<TreemapSectorCell />}
          />
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
