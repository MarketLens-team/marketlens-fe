/** OpenAPI `DashboardOverviewResponse` */

export interface SentimentCountBlockApi {
  avgScore: number
  positiveCount: number
  neutralCount: number
  negativeCount: number
  totalCount: number
}

export interface BuzzStockApi {
  stockCode: string
  stockName: string
  mentionCount: number
  changeRate: number
}

export interface SectorHeatmapItemApi {
  sectorCode: string
  sectorName: string
  avgScore: number
  newsCount: number
}

export interface HotStatementApi {
  personId: number
  personName: string
  personRole: string
  organizationName: string
  speechQuote: string
  sentimentScore: number
  relatedStockCodes: string[]
  publishedAt: string
}

export interface LastCrawlInfoApi {
  lastCrawledAt: string
  analyzedCount: number
}

export interface DashboardOverviewResponse {
  portfolio: SentimentCountBlockApi
  marketSentiment: SentimentCountBlockApi
  buzzTop3: BuzzStockApi[]
  sectorHeatmap: SectorHeatmapItemApi[]
  hotStatements: HotStatementApi[]
  lastCrawlInfo: LastCrawlInfoApi
}
