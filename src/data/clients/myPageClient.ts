import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mapMyPageData } from '../mappers/myPageMapper'
import { mockMyPageData } from '../mocks/myPage.mock'
import type { ApiEnvelope } from '../types/api'
import type { MyPageData } from '../types/myPage'
import type { WatchlistResponse } from '../types/memberApi'
import type { StockSummaryResponse } from '../types/stockApi'
import { fetchAlertSettings, fetchMemberProfile } from './memberClient'
import { fetchStockSummary } from './stockClient'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const WATCHLIST_PATH = '/api/v1/watchlist'

async function fetchWatchlistRows(): Promise<WatchlistResponse[]> {
  const { data } = await api.get<ApiEnvelope<WatchlistResponse[]>>(WATCHLIST_PATH)
  return unwrapApiEnvelope(data, '관심종목을 불러오지 못했습니다.') ?? []
}

async function fetchSummariesForWatchlist(
  watchlist: WatchlistResponse[],
): Promise<Array<StockSummaryResponse | null>> {
  return Promise.all(
    watchlist.map(async (item) => {
      try {
        return await fetchStockSummary(item.stockCode)
      } catch {
        return null
      }
    }),
  )
}

export async function fetchMyPage(): Promise<MyPageData> {
  if (isMockDataSource()) {
    await mockDelay(140)
    return structuredClone(mockMyPageData)
  }

  try {
    const [watchlist, settings, member] = await Promise.all([
      fetchWatchlistRows(),
      fetchAlertSettings(),
      fetchMemberProfile(),
    ])
    const summaries = await fetchSummariesForWatchlist(watchlist)
    return mapMyPageData({ watchlist, summaries, settings, member })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '마이페이지를 불러오지 못했습니다.'))
  }
}
