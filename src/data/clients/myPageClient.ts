import { isMockDataSource } from '../../config/dataSource'
import { getCachedWatchlistResponses } from '../../lib/queryCache'
import { mapMyPageAccountData, mapMyPageWatchlistData } from '../mappers/myPageMapper'
import { mockMyPageData } from '../mocks/myPage.mock'
import type { MyPageData } from '../types/myPage'
import type { WatchlistResponse } from '../types/memberApi'
import type { StockSummaryBatchItemResponse, StockSummaryMetrics } from '../types/stockApi'
import { fetchAlertSettings, fetchMemberProfile } from './memberClient'
import { fetchStockOverview, fetchWatchlistSummariesBatch } from './stockClient'
import { fetchWatchlistResponses } from './watchlistClient'
import type { WatchlistOverviewPrice } from '../mappers/myPageMapper'
import { getApiErrorMessage } from '../util/apiError'
import { mockDelay } from '../util/mockDelay'

export type MyPageFetchScope = 'watchlist' | 'account'

async function resolveWatchlistRows(): Promise<WatchlistResponse[]> {
  const cached = getCachedWatchlistResponses()
  if (cached) return cached
  return fetchWatchlistResponses()
}

function summariesForWatchlist(
  watchlist: WatchlistResponse[],
  batch: StockSummaryBatchItemResponse[],
): Array<StockSummaryMetrics | null> {
  const byCode = new Map(batch.map((item) => [item.stockCode, item]))
  return watchlist.map((item) => byCode.get(item.stockCode) ?? null)
}

async function fetchOverviewPriceByCode(): Promise<Map<string, WatchlistOverviewPrice>> {
  try {
    const overview = await fetchStockOverview()
    return new Map(
      overview.stocks.map((row) => [
        row.code,
        { price: row.price, changePercent: row.changePercent },
      ]),
    )
  } catch {
    return new Map()
  }
}

async function fetchMyPageAccount(): Promise<MyPageData> {
  const [settings, member] = await Promise.all([fetchAlertSettings(), fetchMemberProfile()])
  return mapMyPageAccountData({ settings, member })
}

async function fetchMyPageWatchlist(): Promise<MyPageData> {
  const [watchlist, overviewPriceByCode, batchMetrics] = await Promise.all([
    resolveWatchlistRows(),
    fetchOverviewPriceByCode(),
    fetchWatchlistSummariesBatch().catch(() => [] as StockSummaryBatchItemResponse[]),
  ])
  const summaries = summariesForWatchlist(watchlist, batchMetrics)
  return mapMyPageWatchlistData({ watchlist, summaries, overviewPriceByCode })
}

export async function fetchMyPage(scope: MyPageFetchScope): Promise<MyPageData> {
  if (isMockDataSource()) {
    await mockDelay(140)
    return structuredClone(mockMyPageData)
  }

  try {
    if (scope === 'account') {
      return await fetchMyPageAccount()
    }
    return await fetchMyPageWatchlist()
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '마이페이지를 불러오지 못했습니다.'))
  }
}
