import type { StockSummaryBatchItemResponse } from '../types/stockApi'
import { mockDashboardOverview } from './dashboard.mock'

/** mock 관심종목 — dashboard watchlist와 동일 코드·메트릭 */
export const mockWatchlistSummariesBatch: StockSummaryBatchItemResponse[] =
  mockDashboardOverview.watchlist.map((row) => ({
    stockCode: row.code,
    score: row.sentimentScore,
    mentionCount: row.newsCount,
    mentionChangeRate: row.mentionSurgePercent,
  }))
