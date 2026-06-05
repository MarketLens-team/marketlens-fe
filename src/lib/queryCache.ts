import type { WatchlistResponse } from '../data/types/memberApi'
import { BOOKMARK_IDS_STALE_MS, queryClient, WATCHLIST_STALE_MS } from './queryClient'
import { queryKeys } from './queryKeys'

/** 마이페이지 등 — React Query 캐시에 이미 로드된 watchlist rows 재사용 */
export function getCachedWatchlistResponses(): WatchlistResponse[] | null {
  const data = queryClient.getQueryData<WatchlistResponse[]>(queryKeys.watchlist.rows)
  return data ?? null
}

/** 마이페이지 등 — React Query 캐시에 이미 로드된 북마크 ID 재사용 */
export function getCachedBookmarkIds(): Set<string> | null {
  const data = queryClient.getQueryData<string[]>(queryKeys.bookmarks.ids)
  return data ? new Set(data) : null
}

export async function invalidateWatchlistQueries(): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.rows })
}

export async function invalidateBookmarkIdsQueries(): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.ids })
}

/** StrictMode 리마운트·로그인 invalidate와 겹치지 않도록 공통 옵션 */
export const memberListQueryOptions = {
  retry: false as const,
  refetchOnMount: false as const,
  refetchOnReconnect: false as const,
}

export { WATCHLIST_STALE_MS, BOOKMARK_IDS_STALE_MS }
