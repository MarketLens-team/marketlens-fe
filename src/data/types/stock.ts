export type SentimentPolarity = 'positive' | 'negative' | 'neutral'

export interface StockPriceInfo {
  current: number
  change: number
  changePercent: number
}

export interface StockSummary {
  code: string
  name: string
  imageUrl?: string | null
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

/** 전체 뉴스 피드 — 기사별 관련 종목 태그 */
export interface NewsRelatedStock {
  stockCode: string
  stockName: string
  imageUrl?: string | null
  relevanceScore: number
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
  relatedStocks?: NewsRelatedStock[]
}

export interface StockRelatedStock {
  code: string
  name: string
  imageUrl?: string | null
  market?: string
  sentimentScore: number
  /** `GET /api/v1/stocks/prices` 병합 */
  price?: StockPriceInfo
}

export interface StockPersonTimelineItem {
  id: string
  personId: string
  personName: string
  imageUrl?: string | null
  role: string
  /** OpenAPI `statementSummary` */
  summary: string
  sourceName: string
  publishedAt: string
  relativeLabel: string
  /** 발표 후 1시간 이내 — 시각 라벨 강조(빨간색) */
  isFresh: boolean
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
  /** `GET /api/v1/persons/mentions/cursor` 수집 후 연관 종목 필터 */
  peopleTimeline: StockPersonTimelineItem[]
}

export interface StockSearchItem {
  code: string
  name: string
}

/** 상단 TickerBar 종목 한 줄 */
export interface TickerStockRow {
  id: string
  code: string
  name: string
  price: number
  changePercent: number
}

/** 전체 종목 시세 테이블 — `GET /api/v1/stocks/prices` + directory 병합 */
export interface StockMarketRow {
  code: string
  name: string
  market: string
  sectorName: string
  imageUrl?: string | null
  price: number
  changePercent: number
}

/** 전체 종목 overview — `GET /api/v1/stocks/overview` */
export interface StockOverviewRow {
  code: string
  name: string
  market: string
  sectorCode: string
  sectorName: string
  imageUrl?: string | null
  price: number
  changePercent: number
  mentionCount24h: number
  mentionChangeRate24h: number
  sentimentScore24h: number
}

export interface StockOverview {
  currentNewsCount: number
  stocks: StockOverviewRow[]
}

/** 랭킹 카드 한 줄 — `GET /api/v1/stocks/rankings` */
export interface StockRankingItem {
  code: string
  name: string
  imageUrl?: string | null
  price: number
  changePercent: number
  mentionCount24h: number
  mentionChangeRate24h: number
  sentimentScore24h: number
}

export type StockRankingCategory =
  | 'topMentionCount'
  | 'topSentimentScore'
  | 'topChangeRate'
  | 'topCurrentPrice'

export interface StockRankings {
  topMentionCount: StockRankingItem[]
  topSentimentScore: StockRankingItem[]
  topChangeRate: StockRankingItem[]
  topCurrentPrice: StockRankingItem[]
}
