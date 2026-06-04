/** OpenAPI `components/schemas` — Stocks·News(종목 피드) */

export interface StockInfoResponse {
  code: string
  name: string
  market: string
  sectorName: string
  imageUrl?: string
  currentPrice?: number
  changeRate?: number
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
  aiSummary: string | null
}

/** `GET /api/v1/stocks/summaries/batch` — JWT 관심종목 메트릭 (aiSummary 제외) */
export interface StockSummaryBatchItemResponse {
  stockCode: string
  score: number
  mentionCount: number
  mentionChangeRate: number
}

export type StockSummaryMetrics = Pick<
  StockSummaryResponse,
  'score' | 'mentionCount' | 'mentionChangeRate'
>

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
  imageUrl?: string
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

/** OpenAPI `NewsRelatedStock` — 기사별 관련 종목 태그 */
export interface NewsRelatedStockResponse {
  stockCode: string
  stockName: string
  imageUrl: string
  relevanceScore: number
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
  relatedStocks?: NewsRelatedStockResponse[]
}

export interface NewsFeedResponse {
  content: NewsFeedItemResponse[]
  totalElements: number
  totalPages: number
  page: number
}

/** OpenAPI `NewsFeedCursorResponse` */
export interface NewsFeedCursorResponse {
  items: NewsFeedItemResponse[]
  nextCursor: string | null
  hasNext: boolean
}

/** OpenAPI `NewsFeedAroundResponse` — `around` / `newer` / `older` 공통 */
export interface NewsFeedAroundResponse {
  items: NewsFeedItemResponse[]
  newerCursor: string | null
  hasNewer: boolean
  olderCursor: string | null
  hasOlder: boolean
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
  aiSummary: string | null
}

/** OpenAPI `StockPricesResponse.StockPriceItem` */
export interface StockPriceItemResponse {
  stockCode: string
  stockName: string
  market: string
  imageUrl?: string
  currentPrice?: number
  changeRate?: number
}

/** OpenAPI `StockPricesResponse` — `GET /api/v1/stocks/prices` */
export interface StockPricesResponse {
  items: StockPriceItemResponse[]
}

/** OpenAPI `StockBuzzSurgeResponse` — `GET /api/v1/stocks/buzz-surge` */
export interface StockBuzzSurgeResponse {
  updatedAt: string
  currentNewsCount: number
  topMover: BuzzSurgeTopMoverResponse
  topSentiment: BuzzSurgeTopSentimentResponse
  items: StockBuzzSurgeItemResponse[]
}

/** OpenAPI `StockOverviewItem` — `GET /api/v1/stocks/overview` */
export interface StockOverviewItemResponse {
  stockCode: string
  stockName: string
  market: string
  sectorCode: string
  sectorName: string
  imageUrl?: string
  currentPrice?: number
  changeRate?: number
  mentionCount24h?: number
  mentionChangeRate24h?: number | null
  sentimentScore24h?: number
  sentimentDelta24h?: number | null
}

/** OpenAPI `StockOverviewResponse` — `GET /api/v1/stocks/overview` */
export interface StockOverviewResponse {
  updatedAt?: string
  currentNewsCount: number
  items: StockOverviewItemResponse[]
}

/** OpenAPI `RankingItem` — `GET /api/v1/stocks/rankings` */
export interface StockRankingItemResponse {
  stockCode: string
  stockName: string
  imageUrl?: string
  currentPrice?: number
  changeRate?: number
  mentionCount24h?: number
  mentionChangeRate24h?: number | null
  sentimentScore24h?: number
  /** null = 비교 기간 데이터 부족으로 델타 계산 불가 */
  sentimentDelta24h?: number | null
}

/** OpenAPI `StockRankingsResponse` — `GET /api/v1/stocks/rankings` */
export interface StockRankingsResponse {
  updatedAt?: string
  currentNewsCount?: number
  topMentionCount: StockRankingItemResponse[]
  topSentimentScore: StockRankingItemResponse[]
  topChangeRate: StockRankingItemResponse[]
}

/** OpenAPI `Item` — `GET /api/v1/stocks/today-news` */
export interface StockTodayNewsItemResponse {
  stockCode: string
  stockName: string
  market: string
  sectorCode: string
  sectorName: string
  imageUrl?: string
  todayNewsCount: number
}

/** OpenAPI `StockTodayNewsResponse` — `GET /api/v1/stocks/today-news` */
export interface StockTodayNewsResponse {
  updatedAt: string
  totalTodayNewsCount: number
  items: StockTodayNewsItemResponse[]
}
