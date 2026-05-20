import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mockAdminOverview, mockAdminStocks, mockCrawlingLogs } from '../mocks/admin.mock'
import type { ApiEnvelope } from '../types/api'
import type { AdminStockResponse } from '../types/adminApi'
import type { AdminOverview, AdminStockRow, CrawlingLog } from '../types/admin'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const STOCKS_PATH = '/api/v1/admin/stocks'

function mapAdminStockRow(row: AdminStockResponse): AdminStockRow {
  return {
    stockId: String(row.stockId),
    stockCode: row.stockCode,
    stockName: row.stockName,
    market: row.market,
    deletedAt: row.deletedAt,
    lastNewsCrawledAt: null,
  }
}

/** OpenAPI에 없음 — 목·집계용 */
export async function fetchAdminOverview(): Promise<AdminOverview> {
  if (isMockDataSource()) {
    await mockDelay(100)
    return structuredClone(mockAdminOverview)
  }

  try {
    const stocks = await fetchAdminStocks()
    const active = stocks.filter((row) => !row.deletedAt)
    return {
      totalStocks: active.length,
      crawlingRunsToday: 0,
      failedRuns24h: 0,
      lastCrawlEndedAt: null,
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '어드민 요약을 불러오지 못했습니다.'))
  }
}

/** OpenAPI `getStocks` — `GET /api/v1/admin/stocks` */
export async function fetchAdminStocks(): Promise<AdminStockRow[]> {
  if (isMockDataSource()) {
    await mockDelay(100)
    return structuredClone(mockAdminStocks)
  }

  try {
    const { data } = await api.get<ApiEnvelope<AdminStockResponse[]>>(STOCKS_PATH)
    const rows = unwrapApiEnvelope(data, '종목 목록을 불러오지 못했습니다.') ?? []
    return rows.map(mapAdminStockRow)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '종목 목록을 불러오지 못했습니다.'))
  }
}

/** OpenAPI에 없음 — 목 데이터 유지 */
export async function fetchAdminCrawlingLogs(): Promise<CrawlingLog[]> {
  if (isMockDataSource()) {
    await mockDelay(100)
    return structuredClone(mockCrawlingLogs)
  }
  return []
}
