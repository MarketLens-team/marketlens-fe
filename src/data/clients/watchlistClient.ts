import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { ApiEnvelope } from '../types/api'
import type { WatchlistItem } from '../../store/watchlistStore'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

interface WatchlistDto {
  stockCode: string
  stockName: string
  sectorName?: string
  market?: string
}

const WATCHLIST_PATH = '/api/v1/watchlist'

function mapWatchlistItem(dto: WatchlistDto): WatchlistItem {
  return { code: dto.stockCode, name: dto.stockName }
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  if (isMockDataSource()) {
    await mockDelay(120)
    return []
  }
  try {
    const { data } = await api.get<ApiEnvelope<WatchlistDto[]>>(WATCHLIST_PATH)
    const rows = unwrapApiEnvelope(data, '관심종목을 불러오지 못했습니다.')
    return (rows ?? []).map(mapWatchlistItem)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '관심종목을 불러오지 못했습니다.'))
  }
}

export async function addWatchlistItem(stockCode: string): Promise<void> {
  if (isMockDataSource()) {
    await mockDelay(80)
    return
  }
  try {
    await api.post(`${WATCHLIST_PATH}/${encodeURIComponent(stockCode)}`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '관심종목 추가에 실패했습니다.'))
  }
}

export async function removeWatchlistItem(stockCode: string): Promise<void> {
  if (isMockDataSource()) {
    await mockDelay(80)
    return
  }
  try {
    await api.delete(`${WATCHLIST_PATH}/${encodeURIComponent(stockCode)}`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '관심종목 삭제에 실패했습니다.'))
  }
}

export async function syncWatchlistItems(items: WatchlistItem[]): Promise<void> {
  for (const item of items) {
    await addWatchlistItem(item.code)
  }
}
