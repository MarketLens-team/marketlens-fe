/** 저장 맥락 — OpenAPI `contextType` (PERSON 등은 추후 확장) */
export type NewsBookmarkContextType = 'ALL_NEWS' | 'STOCK'

export interface NewsBookmarkSaveContext {
  type: NewsBookmarkContextType
  stockCode?: string
}

export type BookmarkSortOrder = 'LATEST' | 'OLDEST'

/** `GET /api/v1/bookmarks` 쿼리 */
export interface NewsBookmarkListQuery {
  contextType?: NewsBookmarkContextType
  contextStockCode?: string
  page?: number
  size?: number
  sortOrder?: BookmarkSortOrder
}

/** `GET /api/v1/bookmarks` 페이지 응답 — OpenAPI `NewsBookmarkPageResponse` */
export interface NewsBookmarkPageDto {
  content: NewsBookmarkDto[]
  totalElements: number
  totalPages: number
  page: number
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
  contextLabel?: string | null
  sentimentScore: number
  sentimentLabel: string
}
