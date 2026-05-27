/** 저장 맥락 — OpenAPI `contextType` (PERSON 등은 추후 확장) */
export type NewsBookmarkContextType = 'ALL_NEWS' | 'STOCK'

export interface NewsBookmarkSaveContext {
  type: NewsBookmarkContextType
  stockCode?: string
}

/** `GET /api/v1/bookmarks` 쿼리 — `contextStockCode`만내면 STOCK 필터 */
export interface NewsBookmarkListQuery {
  contextType?: NewsBookmarkContextType
  contextStockCode?: string
}

/** `GET /api/v1/bookmarks/stocks` — OpenAPI `BookmarkStockSummaryResponse` */
export interface BookmarkStockSummaryDto {
  stockCode: string
  stockName: string
  bookmarkCount: number
}

/** `GET /api/v1/bookmarks` — OpenAPI `NewsBookmarkResponse` */
export interface NewsBookmarkDto {
  bookmarkId: number
  newsArticleId: number
  title: string
  originalLink?: string | null
  publisherName?: string | null
  publishedAt: string
  imageUrl?: string | null
  bookmarkedAt: string
  contextType: NewsBookmarkContextType
  contextStockCode?: string | null
  contextStockName?: string | null
  sentimentScore: number
  sentimentLabel: string
}
