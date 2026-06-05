import type { AlertSettingsResponse } from './member'
import type { NewsBookmarkContextType } from './bookmark'
import type { SentimentPolarity } from './stock'

export const MY_PAGE_WATCHLIST_MAX = 10

export interface MyPageBookmarkItem {
  id: string
  title: string
  url?: string
  source: string
  publishedAt: string
  bookmarkedAt: string
  imageUrl?: string | null
  sentimentScore: number
  sentiment: SentimentPolarity
  contextType: NewsBookmarkContextType
  contextStockCode?: string | null
  contextStockName?: string | null
  contextLabel?: string | null
}

export interface MyPageBookmarkPage {
  items: MyPageBookmarkItem[]
  totalElements: number
  totalPages: number
  page: number
}

export interface MyPageBookmarkDateContext {
  contextType: NewsBookmarkContextType
  stockCode?: string | null
  stockName?: string | null
  stockImageUrl?: string | null
  count: number
}

export interface MyPageBookmarkDateSummary {
  date: string // YYYY-MM-DD
  count: number
  contexts: MyPageBookmarkDateContext[]
}

export interface MyPageWatchlistRow {
  code: string
  name: string
  imageUrl?: string | null
  price: number
  changePercent: number
  sentimentScore: number
  mentionSurgePercent: number
}

export interface MyPageSummary {
  watchlistCount: number
  watchlistMax: number
  positiveCount: number
  positiveRatioPercent: number
  needsAttentionCount: number
}

export interface MyPageAccount {
  nickname: string
  email: string
  joinedAt: string
  plan: string
}

export interface MyPageData {
  summary: MyPageSummary
  watchlist: MyPageWatchlistRow[]
  alertSettings: AlertSettingsResponse
  alertExample: string
  account: MyPageAccount
}
