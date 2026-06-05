import { isMockDataSource } from '../../config/dataSource'
import { dedupeAsync } from '../../lib/dedupeAsync'
import { normalizeImageUrl } from '../../lib/normalizeImageUrl'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import type { ApiEnvelope } from '../types/api'
import type { WatchlistResponse } from '../types/memberApi'
import type { WatchlistItem } from '../types/watchlist'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const WATCHLIST_PATH = '/api/v1/watchlist'

/** 로그인 직후 대시보드·StrictMode 동시 호출 병합 */
const WATCHLIST_DEDUPE_TTL_MS = 5_000

function watchlistDedupeKey(): string {
  const isLoggedIn = useAuthStore.getState().isLoggedIn
  return `watchlist:rows:${isLoggedIn ? 'member' : 'guest'}`
}

function mapWatchlistItem(dto: WatchlistResponse): WatchlistItem {
  return {
    code: dto.stockCode,
    name: dto.stockName,
    imageUrl: normalizeImageUrl(dto.imageUrl),
  }
}

/** `GET /api/v1/watchlist` DTO — dashboard 등 매핑 전 단계 */
export async function fetchWatchlistResponses(): Promise<WatchlistResponse[]> {
  if (isMockDataSource()) {
    await mockDelay(120)
    return []
  }
  if (!useAuthStore.getState().isLoggedIn) {
    return []
  }

  return dedupeAsync(
    watchlistDedupeKey(),
    async () => {
      try {
        const { data } = await api.get<ApiEnvelope<WatchlistResponse[]>>(WATCHLIST_PATH)
        return unwrapApiEnvelope(data, '관심종목을 불러오지 못했습니다.') ?? []
      } catch (error) {
        throw new Error(getApiErrorMessage(error, '관심종목을 불러오지 못했습니다.'))
      }
    },
    { ttlMs: WATCHLIST_DEDUPE_TTL_MS },
  )
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const rows = await fetchWatchlistResponses()
  return rows.map(mapWatchlistItem)
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
