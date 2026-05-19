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

/** 구간 내부 경계 */
export const STOCK_SENTIMENT_ZONE_BOUNDARIES = [-60, -20, 20, 60] as const

/** Y축 상·하단 — CMC 0/100 점선과 동일 */
export const STOCK_SENTIMENT_EDGE_BOUNDARIES = [-100, 100] as const

export const STOCK_SENTIMENT_ALL_BOUNDARIES = [
  -100, -60, -20, 20, 60, 100,
] as const

/** Y축 눈금 — CMC(20 간격)처럼 구간 경계만 (±100은 HTML 라벨) */
export const STOCK_SENTIMENT_AXIS_LABELS = [-60, -20, 20, 60] as const

export const STOCK_SENTIMENT_Y_TICKS = [
  ...STOCK_SENTIMENT_EDGE_BOUNDARIES,
  ...STOCK_SENTIMENT_AXIS_LABELS,
] as const

/** Y축 HTML 눈금 렌더 순서 (상→하) */
export const STOCK_SENTIMENT_Y_TICKS_DISPLAY_ORDER = [100, 60, 20, -20, -60, -100] as const

/** CMC 거래량처럼 언급량 막대를 그리는 극도 부정 구간 */
export const STOCK_SENTIMENT_EXTREME_NEGATIVE_Y1 = -100
export const STOCK_SENTIMENT_EXTREME_NEGATIVE_Y2 = -60
export const STOCK_SENTIMENT_EXTREME_NEGATIVE_BAND =
  STOCK_SENTIMENT_EXTREME_NEGATIVE_Y2 - STOCK_SENTIMENT_EXTREME_NEGATIVE_Y1
