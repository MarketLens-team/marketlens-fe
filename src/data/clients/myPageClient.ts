import { isMockDataSource } from '../../config/dataSource'
import { getCachedWatchlistResponses } from '../../store/watchlistStore'
import { mapMyPageData } from '../mappers/myPageMapper'
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

export async function fetchMyPage(): Promise<MyPageData> {
  if (isMockDataSource()) {
    await mockDelay(140)
    return structuredClone(mockMyPageData)
  }

  try {
    const [watchlist, settings, member, overviewPriceByCode, batchMetrics] = await Promise.all([
      resolveWatchlistRows(),
      fetchAlertSettings(),
      fetchMemberProfile(),
      fetchOverviewPriceByCode(),
      fetchWatchlistSummariesBatch().catch(() => [] as StockSummaryBatchItemResponse[]),
    ])
    const summaries = summariesForWatchlist(watchlist, batchMetrics)
    return mapMyPageData({ watchlist, summaries, overviewPriceByCode, settings, member })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '마이페이지를 불러오지 못했습니다.'))
  }
}
