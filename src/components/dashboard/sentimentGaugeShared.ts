import { SENTIMENT_GAUGE_COLORS_LIST } from '../../lib/sentimentPalette'

export const GAUGE_COLORS = [...SENTIMENT_GAUGE_COLORS_LIST]
export const GAUGE_ARCS_LENGTH = [0.2, 0.2, 0.2, 0.2, 0.2]
export const GAUGE_ARC_WIDTH = 0.14
export const GAUGE_CHART_STYLE = { width: '100%', height: 132 } as const

export function scorePercent(score: number, min: number, max: number) {
  const range = max - min
  if (range <= 0) return 0.5
  return Math.min(1, Math.max(0, (score - min) / range))
}

export function sentimentLabel(score: number): string {
  if (score <= -60) return '강한 부정'
  if (score <= -20) return '부정'
  if (score <= 20) return '중립'
  if (score <= 60) return '긍정'
  return '강한 긍정'
}
