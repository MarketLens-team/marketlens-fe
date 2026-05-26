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
  sentimentScore: number
  sentimentLabel: string
}
