/** 감성 점수 -100 ~ +100 구간 */
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
