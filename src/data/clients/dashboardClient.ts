import { isMockDataSource } from '../../config/dataSource'
import { dedupeAsync } from '../../lib/dedupeAsync'
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
import type { StockSummaryBatchItemResponse } from '../types/stockApi'
import { fetchStockPrices, fetchStockRankings, fetchWatchlistSummariesBatch } from './stockClient'
import { fetchWatchlistResponses } from './watchlistClient'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const OVERVIEW_PATH = '/api/v1/dashboard/overview'
const BRIEFING_PATH = '/api/v1/dashboard/briefing'

/** 로그인 직후 StrictMode 이중 mount 병합 */
const DASHBOARD_DEDUPE_TTL_MS = 5_000

function dashboardOverviewKey(): string {
  const isLoggedIn = useAuthStore.getState().isLoggedIn
  return `dashboard:overview:${isLoggedIn ? 'member' : 'guest'}`
}

function metricsByStockCode(
  items: StockSummaryBatchItemResponse[],
): Map<string, StockSummaryBatchItemResponse> {
  return new Map(items.map((item) => [item.stockCode, item]))
}

async function fetchWatchlistForDashboard(): Promise<DashboardOverview['watchlist']> {
  const rows = await fetchWatchlistResponses()
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

  return dedupeAsync(
    'dashboard:briefing',
    async () => {
      try {
        const { data } = await api.get<ApiEnvelope<DashboardBriefingResponse>>(BRIEFING_PATH)
        const raw = unwrapApiEnvelope(data, '오늘 브리핑을 불러오지 못했습니다.')
        return mapDashboardBriefing(raw)
      } catch {
        return null
      }
    },
    { ttlMs: DASHBOARD_DEDUPE_TTL_MS },
  )
}

/** OpenAPI `getOverview` — `GET /api/v1/dashboard/overview` */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return dedupeAsync(dashboardOverviewKey(), fetchDashboardOverviewUncached, {
    ttlMs: DASHBOARD_DEDUPE_TTL_MS,
  })
}

async function fetchMarketOutlierRows(
  buzzSurgeTop3: DashboardOverview['buzzSurgeTop3'],
): Promise<DashboardOverview['marketOutlierRows']> {
  try {
    const rankings = await fetchStockRankings()
    return buildMarketOutlierRows(buzzSurgeTop3, rankings)
  } catch {
    return buildMarketOutlierRows(buzzSurgeTop3, null)
  }
}

async function fetchDashboardOverviewUncached(): Promise<DashboardOverview> {
  if (isMockDataSource()) {
    await mockDelay()
    const overview = structuredClone(mockDashboardOverview)
    const isLoggedIn = Boolean(useAuthStore.getState().token?.trim())
    if (!isLoggedIn) {
      overview.watchlist = []
    }
    overview.marketOutlierRows = await fetchMarketOutlierRows(overview.buzzSurgeTop3)
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
  if (useAuthStore.getState().isLoggedIn) {
    try {
      watchlist = await fetchWatchlistForDashboard()
    } catch {
      watchlist = []
    }
  }

  const mapped = mapDashboardOverview(overview, watchlist)
  const marketOutlierRows = await fetchMarketOutlierRows(mapped.buzzSurgeTop3)

  return { ...mapped, marketOutlierRows }
}
