/** 감성 점수 -100 ~ +100 구간 라벨·경계 */
export interface StockSentimentZone {
  y1: number
  y2: number
  label: string
}

/** y2 내림차순 — 차트 상단부터 */
export const STOCK_SENTIMENT_ZONES: StockSentimentZone[] = [
  { y1: 60, y2: 100, label: '극도의 긍정' },
  { y1: 20, y2: 60, label: '긍정' },
  { y1: -20, y2: 20, label: '중립' },
  { y1: -60, y2: -20, label: '부정' },
  { y1: -100, y2: -60, label: '극도의 부정' },
]

export const STOCK_SENTIMENT_ZONE_BOUNDARIES = [-60, -20, 20, 60] as const

/** 차트 배경 세로 그라데이션 (CMC Fear & Greed 스타일) */
export const CHART_BACKGROUND_GRADIENT_STOPS: ReadonlyArray<{
  offset: string
  color: string
  opacity: number
}> = [
  { offset: '0%', color: 'var(--color-success)', opacity: 0.38 },
  { offset: '18%', color: 'var(--color-success)', opacity: 0.14 },
  { offset: '38%', color: 'var(--color-success)', opacity: 0.04 },
  { offset: '50%', color: 'var(--color-text-muted)', opacity: 0.08 },
  { offset: '62%', color: 'var(--color-danger)', opacity: 0.04 },
  { offset: '82%', color: 'var(--color-danger)', opacity: 0.14 },
  { offset: '100%', color: 'var(--color-danger)', opacity: 0.38 },
]
