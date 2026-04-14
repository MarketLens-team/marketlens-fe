import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mockDefaultStockCode, mockStockDetails } from '../mocks/stock.mock'
import type { StockDetail } from '../types/stock'
import { mockDelay } from '../util/mockDelay'

/** 백엔드 연동 시: `GET /api/v1/stocks/{code}` */
function detailPath(code: string) {
  return `/api/v1/stocks/${encodeURIComponent(code)}`
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
