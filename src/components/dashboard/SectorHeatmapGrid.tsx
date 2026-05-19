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
}

function sectorFill(score: number): string {
  if (score > 15) return 'color-mix(in srgb, #02c076 24%, #1a2332)'
  if (score < -5) return 'color-mix(in srgb, #f6465d 24%, #1a2332)'
  return '#243040'
}

function scoreColor(score: number): string {
  if (score > 0) return '#02c076'
  if (score < 0) return '#f6465d'
  return '#b8c2cc'
}

function SectorTreemapContent(props: Partial<TreemapContentProps>) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    depth = 0,
    name = '',
    sentimentScore = 0,
    mentionCount = 0,
  } = props

  if (depth === 0 || width < 28 || height < 24) {
    return null
  }

  const fill = sectorFill(sentimentScore)
  const pad = 6
  const innerW = width - pad * 2
  const innerH = height - pad * 2
  const showScore = innerW >= 36 && innerH >= 32
  const showMentions = innerW >= 36 && innerH >= 48
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
        stroke="#2a3847"
        strokeWidth={1}
      />
      {showScore ? (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - (showMentions ? 6 : 0)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize={innerW < 52 ? 10 : 11}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + (showMentions ? 10 : 8)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={scoreColor(sentimentScore)}
            fontSize={innerW < 52 ? 12 : 14}
            fontWeight={700}
            fontFamily="IBM Plex Mono, monospace"
          >
            {scoreText}
          </text>
          {showMentions ? (
            <text
              x={x + width / 2}
              y={y + height / 2 + 24}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#7c93a6"
              fontSize={10}
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
    () => [
      {
        name: 'sectors',
        children: cells.map((cell) => ({
          name: cell.name,
          size: cell.mentionCount,
          sentimentScore: cell.sentimentScore,
          mentionCount: cell.mentionCount,
        })),
      },
    ],
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
            stroke="#2a3847"
            isAnimationActive={false}
            content={<SectorTreemapContent />}
          />
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
