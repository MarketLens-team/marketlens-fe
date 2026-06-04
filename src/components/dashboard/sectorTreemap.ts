import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from 'd3-hierarchy'
import type { SectorHeatmapCell } from '../../data/types/dashboard'

/** 섹터 히트맵 — 부호만으로 색 구분 (종목 상세 ±20 중립과 분리) */
const SECTOR_HEATMAP_NEUTRAL_EPSILON = 0.5

export const SECTOR_TREEMAP_PADDING_INNER = 4
export const SECTOR_TREEMAP_PADDING_OUTER = 3
export const SECTOR_TREEMAP_ASPECT = 16 / 9
const SENTIMENT_INTENSITY_RANGE = 50

export type SectorSentimentTone = 'positive' | 'negative' | 'neutral'

export interface SectorTreemapLeaf {
  name: string
  sentimentScore: number
  mentionCount: number
  sentimentTone: SectorSentimentTone
  heatIntensity: number
  x: number
  y: number
  width: number
  height: number
}

type TreemapRoot = { children: SectorHeatmapCell[] }

function isSectorCell(node: TreemapRoot | SectorHeatmapCell): node is SectorHeatmapCell {
  return 'mentionCount' in node
}

export function sectorSentimentTone(score: number): SectorSentimentTone {
  if (score > SECTOR_HEATMAP_NEUTRAL_EPSILON) return 'positive'
  if (score < -SECTOR_HEATMAP_NEUTRAL_EPSILON) return 'negative'
  return 'neutral'
}

export function sectorHeatIntensity(score: number): number {
  const clamped = Math.max(-SENTIMENT_INTENSITY_RANGE, Math.min(SENTIMENT_INTENSITY_RANGE, score))
  return Math.abs(clamped) / SENTIMENT_INTENSITY_RANGE
}

export function sectorTreemapLayoutSize(
  containerWidth: number,
  containerHeight: number,
): { width: number; height: number } {
  if (containerWidth <= 0) return { width: 0, height: 0 }

  let width = containerWidth
  let height = Math.round(width / SECTOR_TREEMAP_ASPECT)

  if (containerHeight > 0 && height > containerHeight) {
    height = containerHeight
    width = Math.round(height * SECTOR_TREEMAP_ASPECT)
  }

  return { width: Math.max(0, width), height: Math.max(0, height) }
}

export function layoutSectorTreemap(
  cells: SectorHeatmapCell[],
  width: number,
  height: number,
): SectorTreemapLeaf[] {
  if (width <= 0 || height <= 0 || cells.length === 0) return []

  const root = hierarchy<TreemapRoot | SectorHeatmapCell>({ children: cells })
    .sum((d) => (isSectorCell(d) ? Math.max(d.mentionCount, 1) : 0))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  treemap<TreemapRoot | SectorHeatmapCell>()
    .tile(treemapSquarify.ratio(1))
    .size([width, height])
    .paddingInner(SECTOR_TREEMAP_PADDING_INNER)
    .paddingOuter(SECTOR_TREEMAP_PADDING_OUTER)
    .round(true)(root)

  return (root.leaves() as HierarchyRectangularNode<SectorHeatmapCell>[]).map((node) => {
    const cell = node.data
    return {
      name: cell.name,
      sentimentScore: cell.sentimentScore,
      mentionCount: cell.mentionCount,
      sentimentTone: sectorSentimentTone(cell.sentimentScore),
      heatIntensity: sectorHeatIntensity(cell.sentimentScore),
      x: node.x0,
      y: node.y0,
      width: node.x1 - node.x0,
      height: node.y1 - node.y0,
    }
  })
}
