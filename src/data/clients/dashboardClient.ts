import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import {
  mapDashboardOverview,
  mapDashboardWatchlistRow,
} from '../mappers/dashboardMapper'
import { mockDashboardOverview } from '../mocks/dashboard.mock'
import type { ApiEnvelope } from '../types/api'
import type { DashboardOverview } from '../types/dashboard'
import type { DashboardOverviewResponse } from '../types/dashboardApi'
import type { WatchlistResponse } from '../types/memberApi'
import { fetchStockPrices, fetchStockSummary } from './stockClient'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const OVERVIEW_PATH = '/api/v1/dashboard/overview'
const WATCHLIST_PATH = '/api/v1/watchlist'

async function fetchWatchlistForDashboard(): Promise<DashboardOverview['watchlist']> {
  const { data } = await api.get<ApiEnvelope<WatchlistResponse[]>>(WATCHLIST_PATH)
  const rows = unwrapApiEnvelope(data, '관심종목을 불러오지 못했습니다.') ?? []
  if (rows.length === 0) return []

  const codes = rows.map((item) => item.stockCode)
  const [summaries, priceRows] = await Promise.all([
    Promise.all(
      rows.map(async (item) => {
        try {
          return await fetchStockSummary(item.stockCode)
        } catch {
          return null
        }
      }),
    ),
    fetchStockPrices(codes).catch(() => []),
  ])
  const priceByCode = new Map(priceRows.map((row) => [row.code, row]))
  return rows.map((item, index) =>
    mapDashboardWatchlistRow(item, summaries[index], priceByCode.get(item.stockCode)),
  )
}

/** OpenAPI `getOverview` — `GET /api/v1/dashboard/overview` */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  if (isMockDataSource()) {
    await mockDelay()
    return structuredClone(mockDashboardOverview)
  }

  let overview: DashboardOverviewResponse
  try {
    const { data } = await api.get<ApiEnvelope<DashboardOverviewResponse>>(OVERVIEW_PATH)
    overview = unwrapApiEnvelope(data, '대시보드를 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '대시보드를 불러오지 못했습니다.'))
  }

  let watchlist: DashboardOverview['watchlist'] = []
  try {
    watchlist = await fetchWatchlistForDashboard()
  } catch {
    watchlist = []
  }

  return mapDashboardOverview(overview, watchlist)
}
