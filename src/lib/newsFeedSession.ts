import { NEWS_FEED_SESSION_KEY } from '../constants/storage'
import { getLayoutScrollRoot } from '../hooks/useInfiniteScroll'
import type { StockNewsItem, StockNewsPagination } from '../data/types/stock'

export type NewsFeedMode = 'all' | 'watchlist'

export interface NewsFeedSessionSnapshot {
  mode: NewsFeedMode
  items: StockNewsItem[]
  pagination: StockNewsPagination
  scrollTop: number
  focusNewsId: string
  savedAt: number
}

let liveSnapshot: Omit<NewsFeedSessionSnapshot, 'scrollTop' | 'focusNewsId' | 'savedAt'> | null =
  null

/** storage 삭제 후 React Strict Mode 재마운트용 */
let consumedSessionMemory: NewsFeedSessionSnapshot | null = null

export function registerNewsFeedLiveSnapshot(snapshot: {
  mode: NewsFeedMode
  items: StockNewsItem[]
  pagination: StockNewsPagination
}) {
  liveSnapshot = snapshot
}

export function clearNewsFeedLiveSnapshot() {
  liveSnapshot = null
}

export function saveNewsFeedSessionBeforeStockNav(focusNewsId: string) {
  if (!liveSnapshot || liveSnapshot.items.length === 0) return

  const payload: NewsFeedSessionSnapshot = {
    ...liveSnapshot,
    scrollTop: getLayoutScrollRoot()?.scrollTop ?? 0,
    focusNewsId,
    savedAt: Date.now(),
  }

  consumedSessionMemory = null
  try {
    sessionStorage.setItem(NEWS_FEED_SESSION_KEY, JSON.stringify(payload))
  } catch {
    /* quota 등 — 복원 실패 시 focus 훅이 cursor 로드로 폴백 */
  }
}

export function clearNewsFeedConsumedMemory() {
  consumedSessionMemory = null
}

function parseSession(raw: string | null): NewsFeedSessionSnapshot | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as NewsFeedSessionSnapshot
    if (!data || typeof data !== 'object') return null
    if (data.mode !== 'all' && data.mode !== 'watchlist') return null
    if (!Array.isArray(data.items) || !data.focusNewsId) return null
    if (typeof data.scrollTop !== 'number' || !Number.isFinite(data.scrollTop)) return null
    if (!data.pagination || typeof data.pagination.hasNext !== 'boolean') return null
    return data
  } catch {
    return null
  }
}

/** `?newsId=` 복귀 시 1회 소비 — 일치하면 스냅샷 반환 후 storage 삭제 */
export function consumeNewsFeedSession(
  focusNewsId: string | null,
  mode: NewsFeedMode,
): NewsFeedSessionSnapshot | null {
  if (!focusNewsId) return null

  if (
    consumedSessionMemory &&
    consumedSessionMemory.focusNewsId === focusNewsId &&
    consumedSessionMemory.mode === mode
  ) {
    return consumedSessionMemory
  }

  const session = parseSession(sessionStorage.getItem(NEWS_FEED_SESSION_KEY))
  if (!session) return null
  if (session.focusNewsId !== focusNewsId || session.mode !== mode) return null

  sessionStorage.removeItem(NEWS_FEED_SESSION_KEY)
  consumedSessionMemory = session
  return session
}

export function readNewsFeedSessionModeHint(): NewsFeedMode | null {
  const session = parseSession(sessionStorage.getItem(NEWS_FEED_SESSION_KEY))
  return session?.mode ?? null
}
