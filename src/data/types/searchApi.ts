/** OpenAPI Search — `GET /api/v1/search` */

import type { NewsFeedItemResponse } from './stockApi'

export interface PersonStatementItemResponse {
  statementId: number
  speechQuote: string
  sourceName: string
  publishedAt: string
  sentimentScore: number
  sentiment: string
}

export interface StockSearchItemResponse {
  stockId?: number
  stockCode: string
  stockName: string
  market?: string
  sectorCode?: string
  sectorName?: string
  relatedNews?: NewsFeedItemResponse[]
}

export interface PersonSearchItemResponse {
  personId: number
  personName: string
  personRole: string
  organizationName: string
  relatedNews?: NewsFeedItemResponse[]
  relatedStatements?: PersonStatementItemResponse[]
}

export interface FallbackStockItemResponse {
  stockCode: string
  stockName: string
  market?: string
  sectorCode?: string
  sectorName?: string
  mentionCount: number
}

export interface FallbackPersonItemResponse {
  personId: number
  personName: string
  personRole: string
  organizationName: string
  mentionCount: number
}

export interface FallbackSectionsResponse {
  hotStocks: FallbackStockItemResponse[]
  topPersons: FallbackPersonItemResponse[]
  latestNews: NewsFeedItemResponse[]
}

export interface SearchResponse {
  stocks: StockSearchItemResponse[]
  persons: PersonSearchItemResponse[]
  /** 검색어 매칭 시 관련 최신 뉴스 (최대 10건) */
  news?: NewsFeedItemResponse[]
  fallbackSections?: FallbackSectionsResponse | null
}
