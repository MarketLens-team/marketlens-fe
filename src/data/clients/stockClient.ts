import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mockDefaultStockCode, mockStockDetails } from '../mocks/stock.mock'
import type { StockDetail, StockSearchItem } from '../types/stock'
import { mockDelay } from '../util/mockDelay'

/** 백엔드 연동 시: `GET /api/v1/stocks/{code}` */
function detailPath(code: string) {
  return `/api/v1/stocks/${encodeURIComponent(code)}`
}

function searchPath(query: string) {
  return `/api/v1/stocks/search?q=${encodeURIComponent(query)}`
}

export async function fetchStockDetail(stockCode: string): Promise<StockDetail> {
  if (!stockCode.trim()) {
    throw new Error('stockCode is required')
  }
  if (isMockDataSource()) {
    await mockDelay(120)
    const hit = mockStockDetails[stockCode] ?? mockStockDetails[mockDefaultStockCode]
    return structuredClone(hit)
  }
  const { data } = await api.get<StockDetail>(detailPath(stockCode))
  return data
}

export async function fetchStockSearch(query: string): Promise<StockSearchItem[]> {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  if (isMockDataSource()) {
    await mockDelay(100)
    const all = Object.values(mockStockDetails).map((d) => ({
      code: d.stock.code,
      name: d.stock.name,
    }))
    return all
      .filter((item) => item.code.toLowerCase().includes(normalized) || item.name.toLowerCase().includes(normalized))
      .slice(0, 12)
  }

  const { data } = await api.get<StockSearchItem[]>(searchPath(query))
  return data
}
