import { hierarchy, treemap, type HierarchyRectangularNode } from 'd3-hierarchy'
import type { SectorHeatmapCell } from '../../data/types/dashboard'

export const SECTOR_TREEMAP_PADDING = 4
const SENTIMENT_RANGE = 50

export interface SectorTreemapLeaf {
  name: string
  sentimentScore: number
  mentionCount: number
  x: number
  y: number
  width: number
  height: number
}

type TreemapRoot = { children: SectorHeatmapCell[] }

function isSectorCell(node: TreemapRoot | SectorHeatmapCell): node is SectorHeatmapCell {
  return 'mentionCount' in node
}

function lerpByte(from: number, to: number, t: number) {
  return Math.round(from + (to - from) * t)
}

/** 감성 -50~+50, 절댓값이 클수록 진한 green/red */
export function sentimentFill(score: number): string {
  const clamped = Math.max(-SENTIMENT_RANGE, Math.min(SENTIMENT_RANGE, score))
  const intensity = Math.abs(clamped) / SENTIMENT_RANGE

  if (clamped > 0) {
    return `rgb(${lerpByte(0x28, 0x05, intensity)}, ${lerpByte(0x55, 0x6e, intensity)}, ${lerpByte(0x45, 0x48, intensity)})`
  }
  if (clamped < 0) {
    return `rgb(${lerpByte(0x52, 0x82, intensity)}, ${lerpByte(0x2c, 0x18, intensity)}, ${lerpByte(0x34, 0x22, intensity)})`
  }
  return '#3a4d62'
}

export function sentimentScoreColor(score: number): string {
  if (score > 0) return '#9dffd0'
  if (score < 0) return '#ffc4cc'
  return '#e8f0f8'
}

export function layoutSectorTreemap(
  cells: SectorHeatmapCell[],
  width: number,
  height: number,
): SectorTreemapLeaf[] {
  if (width <= 0 || height <= 0 || cells.length === 0) return []

  const root = hierarchy<TreemapRoot | SectorHeatmapCell>({ children: cells }).sum((d) =>
    isSectorCell(d) ? d.mentionCount : 0,
  )

  treemap<TreemapRoot | SectorHeatmapCell>()
    .size([width, height])
    .padding(SECTOR_TREEMAP_PADDING)
    .round(true)(root)

  return (root.leaves() as HierarchyRectangularNode<SectorHeatmapCell>[]).map((node) => {
    const cell = node.data
    return {
      name: cell.name,
      sentimentScore: cell.sentimentScore,
      mentionCount: cell.mentionCount,
      x: node.x0,
      y: node.y0,
      width: node.x1 - node.x0,
      height: node.y1 - node.y0,
    }
  })
}
