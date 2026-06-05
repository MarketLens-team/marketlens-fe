import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { buildMarketOutlierRows } from '../mappers/dashboardMarketOutliers'
import {
  mapDashboardBriefing,
  mapDashboardOverview,
  mapDashboardWatchlistRow,
} from '../mappers/dashboardMapper'
import { mockDashboardBriefing, mockDashboardOverview } from '../mocks/dashboard.mock'
import type { ApiEnvelope } from '../types/api'
import type { DashboardBriefing, DashboardOverview } from '../types/dashboard'
import type { DashboardBriefingResponse, DashboardOverviewResponse } from '../types/dashboardApi'
import type { WatchlistResponse } from '../types/memberApi'
import type { StockSummaryBatchItemResponse } from '../types/stockApi'
import { fetchStockPrices, fetchStockRankings, fetchWatchlistSummariesBatch } from './stockClient'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const OVERVIEW_PATH = '/api/v1/dashboard/overview'
const BRIEFING_PATH = '/api/v1/dashboard/briefing'
const WATCHLIST_PATH = '/api/v1/watchlist'

function metricsByStockCode(
  items: StockSummaryBatchItemResponse[],
): Map<string, StockSummaryBatchItemResponse> {
  return new Map(items.map((item) => [item.stockCode, item]))
}

async function fetchWatchlistForDashboard(): Promise<DashboardOverview['watchlist']> {
  const { data } = await api.get<ApiEnvelope<WatchlistResponse[]>>(WATCHLIST_PATH)
  const rows = unwrapApiEnvelope(data, '관심종목을 불러오지 못했습니다.') ?? []
  if (rows.length === 0) return []

  const codes = rows.map((item) => item.stockCode)
  const [batchMetrics, priceRows] = await Promise.all([
    fetchWatchlistSummariesBatch().catch(() => [] as StockSummaryBatchItemResponse[]),
    fetchStockPrices(codes).catch(() => []),
  ])
  const metricsByCode = metricsByStockCode(batchMetrics)
  const priceByCode = new Map(priceRows.map((row) => [row.code, row]))
  return rows.map((item) =>
    mapDashboardWatchlistRow(item, metricsByCode.get(item.stockCode) ?? null, priceByCode.get(item.stockCode)),
  )
}

/** OpenAPI `getBriefing` — `GET /api/v1/dashboard/briefing` (`member_daily_briefing.today_summary`) */
export async function fetchDashboardBriefing(): Promise<DashboardBriefing | null> {
  if (isMockDataSource()) {
    await mockDelay(80)
    return structuredClone(mockDashboardBriefing)
  }

  try {
    const { data } = await api.get<ApiEnvelope<DashboardBriefingResponse>>(BRIEFING_PATH)
    const raw = unwrapApiEnvelope(data, '오늘 브리핑을 불러오지 못했습니다.')
    return mapDashboardBriefing(raw)
  } catch {
    return null
  }
}

/** OpenAPI `getOverview` — `GET /api/v1/dashboard/overview` */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  if (isMockDataSource()) {
    await mockDelay()
    const overview = structuredClone(mockDashboardOverview)
    const isLoggedIn = Boolean(useAuthStore.getState().token?.trim())
    if (!isLoggedIn) {
      overview.watchlist = []
      try {
        const rankings = await fetchStockRankings()
        overview.marketOutlierRows = buildMarketOutlierRows(overview.buzzSurgeTop3, rankings)
      } catch {
        overview.marketOutlierRows = buildMarketOutlierRows(overview.buzzSurgeTop3, null)
      }
    } else {
      overview.marketOutlierRows = []
    }
    return overview
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

  const mapped = mapDashboardOverview(overview, watchlist)
  let marketOutlierRows = mapped.marketOutlierRows

  if (watchlist.length === 0) {
    try {
      const rankings = await fetchStockRankings()
      marketOutlierRows = buildMarketOutlierRows(mapped.buzzSurgeTop3, rankings)
    } catch {
      marketOutlierRows = buildMarketOutlierRows(mapped.buzzSurgeTop3, null)
    }
  }

  return { ...mapped, marketOutlierRows }
}
