import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mockStockDirectory } from '../mocks/stockDirectory.mock'
import { mockDefaultStockCode, mockStockDetails } from '../mocks/stock.mock'
import type { StockDirectory } from '../types/stockDirectory'
import type { StockDetail, StockSearchItem } from '../types/stock'
import type { ApiEnvelope } from '../types/api'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const DIRECTORY_PATH = '/api/v1/stocks'

/** 백엔드 연동 시: `GET /api/v1/stocks/{code}` */
function detailPath(code: string) {
  return `/api/v1/stocks/${encodeURIComponent(code)}`
}

function searchPath(query: string) {
  return `/api/v1/stocks/search?q=${encodeURIComponent(query)}`
}

export async function fetchStockDirectory(): Promise<StockDirectory> {
  if (isMockDataSource()) {
    await mockDelay(140)
    return structuredClone(mockStockDirectory)
  }
  try {
    const { data } = await api.get<ApiEnvelope<StockDirectory>>(DIRECTORY_PATH)
    return unwrapApiEnvelope(data, '종목 목록을 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '종목 목록을 불러오지 못했습니다.'))
  }
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
    const all = mockStockDirectory.sectors.flatMap((sector) => sector.stocks)
    return all
      .filter((item) => item.code.toLowerCase().includes(normalized) || item.name.toLowerCase().includes(normalized))
      .slice(0, 12)
  }

  const { data } = await api.get<StockSearchItem[]>(searchPath(query))
  return data
}
