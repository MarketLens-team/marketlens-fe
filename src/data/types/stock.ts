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
  /** 리드·요약 (추후 API 연동) */
  description?: string
  source: string
  /** ISO 8601 */
  publishedAt: string
  sentiment: SentimentPolarity
  sentimentScore: number
  aiReason: string
  /** 제목 강조 키워드 (종목명·티커 등) */
  highlightTerms?: string[]
  imageUrl?: string | null
  url?: string
}

export interface StockRelatedStock {
  code: string
  name: string
  market?: string
  sentimentScore: number
}

export interface StockPersonTimelineItem {
  id: string
  personName: string
  role: string
  relativeLabel: string
  sentimentScore: number
}

export interface StockNewsPagination {
  nextCursor: string | null
  hasNext: boolean
}

export interface StockDetail {
  stock: StockSummary
  /** `GET /api/v1/stocks/{code}` → watchlist.interested */
  watchlistInterested: boolean
  sentimentContext: StockSentimentContext
  sentimentBreakdown: StockSentimentBreakdown
  recentNews: StockNewsItem[]
  /** `GET /api/v1/news/feed/{ticker}/cursor` */
  newsPagination: StockNewsPagination
  relatedStocks: StockRelatedStock[]
  /** `GET /api/v1/persons/mentions` — 연관 종목 필터 */
  peopleTimeline: StockPersonTimelineItem[]
}

export interface StockSearchItem {
  code: string
  name: string
}
