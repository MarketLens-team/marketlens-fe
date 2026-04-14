import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mockAdminOverview, mockAdminStocks, mockCrawlingLogs } from '../mocks/admin.mock'
import type { AdminOverview, AdminStockRow, CrawlingLog } from '../types/admin'
import { mockDelay } from '../util/mockDelay'

/** `crawling_log`·`stock` 집계 DTO — Spring 경로는 팀 컨벤션에 맞게 조정 */
const PATHS = {
  overview: '/api/v1/admin/overview',
  stocks: '/api/v1/admin/stocks',
  crawlingLogs: '/api/v1/admin/crawling/logs',
} as const

export async function fetchAdminOverview(): Promise<AdminOverview> {
  if (isMockDataSource()) {
    await mockDelay(100)
    return structuredClone(mockAdminOverview)
  }
  const { data } = await api.get<AdminOverview>(PATHS.overview)
  return data
}

export async function fetchAdminStocks(): Promise<AdminStockRow[]> {
  if (isMockDataSource()) {
    await mockDelay(100)
    return structuredClone(mockAdminStocks)
  }
  const { data } = await api.get<AdminStockRow[]>(PATHS.stocks)
  return data
}

export async function fetchAdminCrawlingLogs(): Promise<CrawlingLog[]> {
  if (isMockDataSource()) {
    await mockDelay(100)
    return structuredClone(mockCrawlingLogs)
  }
  const { data } = await api.get<CrawlingLog[]>(PATHS.crawlingLogs)
  return data
}
