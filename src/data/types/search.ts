/** 통합 검색 UI 모델 */

export interface SearchNewsPreview {
  id: string
  title: string
  source: string
  publishedAt: string
  url?: string
  imageUrl?: string | null
  sentimentScore: number
}

export interface SearchStatementPreview {
  id: string
  quote: string
  sourceName: string
  publishedAt: string
  sentimentScore: number
  sentiment: string
}

export interface SearchStockResult {
  code: string
  name: string
  market?: string
  sectorCode?: string
  sectorName?: string
  relatedNews: SearchNewsPreview[]
}

export interface SearchPersonResult {
  personId: string
  personName: string
  role: string
  organizationName: string
  relatedNews: SearchNewsPreview[]
  relatedStatements: SearchStatementPreview[]
}

export interface SearchFallbackStock {
  code: string
  name: string
  market?: string
  sectorCode?: string
  sectorName?: string
  mentionCount: number
}

export interface SearchFallbackSectorGroup {
  sectorCode: string
  sectorName: string
  stocks: SearchFallbackStock[]
}

export interface SearchFallbackPerson {
  personId: string
  personName: string
  role: string
  organizationName: string
  mentionCount: number
}

export interface SearchFallbackSections {
  stockSectors: SearchFallbackSectorGroup[]
  topPersons: SearchFallbackPerson[]
  latestNews: SearchNewsPreview[]
}

export interface UnifiedSearchResult {
  stocks: SearchStockResult[]
  persons: SearchPersonResult[]
  /** 검색 결과 공통 뉴스 (최대 10건) */
  news: SearchNewsPreview[]
  fallback: SearchFallbackSections | null
}
