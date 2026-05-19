export type SentimentPolarity = 'positive' | 'negative' | 'neutral'

export interface StockPriceInfo {
  current: number
  change: number
  changePercent: number
}

export interface StockSummary {
  code: string
  name: string
  market: string
  sector: string
  sentimentScore: number
  /** 24h 언급량 변화율 (%) */
  mentionChangePercent: number
  buzz24h: number
  price: StockPriceInfo
  /** AI 감성 요약 한 줄 */
  aiSummary: string
}

/** 일별 감성 추이 (차트용) */
export interface StockSentimentTrendPoint {
  /** ISO 8601 */
  recordedAt: string
  score: number
  mentionCount: number
}

export interface StockSentimentContext {
  current: number
  avg30d: number
  high30d: number
  summaryNote: string
  /** 최근 30일 일별 감성·언급량 */
  trend: StockSentimentTrendPoint[]
}

export interface StockSentimentBreakdownRow {
  polarity: SentimentPolarity
  label: string
  count: number
  avgScore: number
  percent: number
}

export interface StockSentimentBreakdown {
  rows: StockSentimentBreakdownRow[]
  totalCount: number
  finalScore: number
}

export interface StockNewsItem {
  id: string
  title: string
  source: string
  /** ISO 8601 */
  publishedAt: string
  sentiment: SentimentPolarity
  sentimentScore: number
  aiReason: string
  url?: string
}

export interface StockRelatedStock {
  code: string
  name: string
  sentimentScore: number
}

export interface StockPersonTimelineItem {
  id: string
  personName: string
  role: string
  relativeLabel: string
  sentimentScore: number
}

export interface StockDetail {
  stock: StockSummary
  sentimentContext: StockSentimentContext
  sentimentBreakdown: StockSentimentBreakdown
  recentNews: StockNewsItem[]
  relatedStocks: StockRelatedStock[]
  peopleTimeline: StockPersonTimelineItem[]
}

export interface StockSearchItem {
  code: string
  name: string
}
