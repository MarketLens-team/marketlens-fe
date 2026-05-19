import type { SentimentTone } from './stockSentimentInterpretation'

/** 감성 점수 -100 ~ +100 구간 */
export interface StockSentimentZone {
  y1: number
  y2: number
  label: string
  tone: SentimentTone
}

/** y2 내림차순 — 차트 상단부터 */
export const STOCK_SENTIMENT_ZONES: StockSentimentZone[] = [
  { y1: 60, y2: 100, label: '극도의 긍정', tone: 'extremePositive' },
  { y1: 20, y2: 60, label: '긍정', tone: 'positive' },
  { y1: -20, y2: 20, label: '중립', tone: 'neutral' },
  { y1: -60, y2: -20, label: '부정', tone: 'negative' },
  { y1: -100, y2: -60, label: '극도의 부정', tone: 'extremeNegative' },
]

export const STOCK_SENTIMENT_ZONE_BOUNDARIES = [-60, -20, 20, 60] as const

export const STOCK_SENTIMENT_Y_TICKS = [-100, -60, -20, 20, 60, 100] as const
