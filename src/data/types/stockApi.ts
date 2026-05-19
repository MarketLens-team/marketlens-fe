/** OpenAPI `components/schemas` — Stocks·News(종목 피드) */

export interface StockInfoResponse {
  code: string
  name: string
  market: string
  sectorName: string
}

export interface WatchlistInfoResponse {
  interested: boolean
}

export interface StockDetailResponse {
  stock: StockInfoResponse
  watchlist: WatchlistInfoResponse
}

export interface StockSummaryResponse {
  score: number
  mentionCount: number
  mentionChangeRate: number
  aiSummary: string
}

export interface DailyPointResponse {
  recordedAt: string
  score: number
  mentionCount: number
}

export interface StockSentimentTrendResponse {
  currentScore: number
  currentMentionCount: number
  averageScore30d: number
  maxScore30d: number
  contextMessage: string
  trend: DailyPointResponse[]
}

export interface SentimentCategoryResponse {
  count: number
  ratio: number
}

export interface StockSentimentBreakdownResponse {
  positive: SentimentCategoryResponse
  neutral: SentimentCategoryResponse
  negative: SentimentCategoryResponse
  totalCount: number
  totalAverageScore: number
}

export interface RelatedStockItemResponse {
  code: string
  name: string
  market: string
  sentimentScore: number
}

export interface RelatedStocksResponse {
  sectorName: string
  stocks: RelatedStockItemResponse[]
}

export interface StockDirectoryResponse {
  sectors: Array<{
    sectorCode: string
    sectorName: string
    stocks: Array<{
      code: string
      name: string
      market: string
    }>
  }>
}

export interface NewsFeedItemResponse {
  id: number
  title: string
  description: string
  originalLink: string
  source: string
  publishedAt: string
  imageUrl: string
  sentimentScore: number
  sentiment: string
}

export interface NewsFeedResponse {
  content: NewsFeedItemResponse[]
  totalElements: number
  totalPages: number
  page: number
}

/** OpenAPI `TopMover` */
export interface BuzzSurgeTopMoverResponse {
  stockCode: string
  stockName: string
  currentMentionCount: number
  previousMentionCount: number
  rolling24hChangeRate: number
}

/** OpenAPI `TopSentiment` */
export interface BuzzSurgeTopSentimentResponse {
  stockCode: string
  stockName: string
  sentimentScore: number
}

/** OpenAPI `Item` */
export interface StockBuzzSurgeItemResponse {
  rank: number
  stockCode: string
  stockName: string
  currentMentionCount: number
  previousMentionCount: number
  rolling24hChangeRate: number
  sentimentScore: number
  aiSummary: string
}

/** OpenAPI `StockBuzzSurgeResponse` — `GET /api/v1/stocks/buzz-surge` */
export interface StockBuzzSurgeResponse {
  updatedAt: string
  currentNewsCount: number
  topMover: BuzzSurgeTopMoverResponse
  topSentiment: BuzzSurgeTopSentimentResponse
  items: StockBuzzSurgeItemResponse[]
}
