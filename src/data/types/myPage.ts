import type { AlertSettings } from './member'

export const MY_PAGE_WATCHLIST_MAX = 10

export interface MyPageWatchlistRow {
  code: string
  name: string
  price: number
  changePercent: number
  sentimentScore: number
  mentionSurgePercent: number
  hasAlert: boolean
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
  alertSettings: AlertSettings
  alertExample: string
  account: MyPageAccount
}
