/** OpenAPI Search — `GET /api/v1/search` */

import type { NewsFeedItemResponse } from './stockApi'

export type SearchNewsSourceType = 'stock' | 'person' | 'mixed' | 'unknown'

export interface SearchNewsStockTagResponse {
  stockCode: string
  stockName: string
  relevanceScore?: number
}

export interface SearchNewsPersonTagResponse {
  personId: number
  personName: string
  personRole?: string
  organizationName?: string
  relevanceScore?: number
}

/** `SearchResponse.SearchNewsItem` — 통합·fallback 뉴스 */
export interface SearchNewsItemResponse {
  id: number
  title: string
  description: string
  originalLink: string
  source: string
  publishedAt: string
  imageUrl: string
  sentimentScore: number
  sentiment: string
  sourceType: SearchNewsSourceType | string
  primaryStockCode: string | null
  stocks: SearchNewsStockTagResponse[]
  persons: SearchNewsPersonTagResponse[]
}

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
  imageUrl?: string
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
  imageUrl?: string
  relatedStatements?: PersonStatementItemResponse[]
}

export interface FallbackStockItemResponse {
  stockCode: string
  stockName: string
  imageUrl?: string
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
  imageUrl?: string
  mentionCount: number
}

export interface FallbackSectionsResponse {
  hotStocks: FallbackStockItemResponse[]
  topPersons: FallbackPersonItemResponse[]
  latestNews: SearchNewsItemResponse[]
}

export interface SearchResponse {
  stocks: StockSearchItemResponse[]
  persons: PersonSearchItemResponse[]
  /** 검색어 매칭 시 관련 최신 뉴스 (최대 10건) */
  news?: SearchNewsItemResponse[]
  fallbackSections?: FallbackSectionsResponse | null
}
