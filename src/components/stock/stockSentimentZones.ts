/** 감성 점수 -100 ~ +100 구간 (CMC Fear & Greed 스타일 배경) */
export interface StockSentimentZone {
  y1: number
  y2: number
  label: string
  fill: string
}

/** y2 내림차순 — 차트 상단부터 */
export const STOCK_SENTIMENT_ZONES: StockSentimentZone[] = [
  {
    y1: 60,
    y2: 100,
    label: '극도의 긍정',
    fill: 'color-mix(in srgb, var(--color-success) 42%, var(--color-bg-app))',
  },
  {
    y1: 20,
    y2: 60,
    label: '긍정',
    fill: 'color-mix(in srgb, var(--color-success) 24%, var(--color-bg-app))',
  },
  {
    y1: -20,
    y2: 20,
    label: '중립',
    fill: 'color-mix(in srgb, var(--color-text-muted) 22%, var(--color-bg-app))',
  },
  {
    y1: -60,
    y2: -20,
    label: '부정',
    fill: 'color-mix(in srgb, var(--color-danger) 24%, var(--color-bg-app))',
  },
  {
    y1: -100,
    y2: -60,
    label: '극도의 부정',
    fill: 'color-mix(in srgb, var(--color-danger) 42%, var(--color-bg-app))',
  },
]

export const STOCK_SENTIMENT_ZONE_BOUNDARIES = [-60, -20, 20, 60] as const
