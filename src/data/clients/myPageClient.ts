import { isMockDataSource } from '../../config/dataSource'
import { getCachedWatchlistResponses } from '../../lib/queryCache'
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

/** watchlist 탭만 overview·batch·관심종목 로드. account·news는 settings·me만 */
export type MyPageFetchScope = 'watchlist' | 'shell'

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

async function fetchMyPageShell(): Promise<MyPageData> {
  const [settings, member] = await Promise.all([fetchAlertSettings(), fetchMemberProfile()])
  return mapMyPageData({ watchlist: [], summaries: [], settings, member })
}

async function fetchMyPageWatchlist(): Promise<MyPageData> {
  const [watchlist, settings, member, overviewPriceByCode, batchMetrics] = await Promise.all([
    resolveWatchlistRows(),
    fetchAlertSettings(),
    fetchMemberProfile(),
    fetchOverviewPriceByCode(),
    fetchWatchlistSummariesBatch().catch(() => [] as StockSummaryBatchItemResponse[]),
  ])
  const summaries = summariesForWatchlist(watchlist, batchMetrics)
  return mapMyPageData({ watchlist, summaries, overviewPriceByCode, settings, member })
}

export async function fetchMyPage(scope: MyPageFetchScope = 'watchlist'): Promise<MyPageData> {
  if (isMockDataSource()) {
    await mockDelay(140)
    return structuredClone(mockMyPageData)
  }

  try {
    if (scope === 'shell') {
      return await fetchMyPageShell()
    }
    return await fetchMyPageWatchlist()
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '마이페이지를 불러오지 못했습니다.'))
  }
}
