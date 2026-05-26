import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchAllNewsFeedAround,
  fetchAllNewsFeedCursor,
  fetchAllNewsFeedNewer,
  fetchAllNewsFeedOlder,
  fetchWatchlistNewsFeedAround,
  fetchWatchlistNewsFeedCursor,
  fetchWatchlistNewsFeedNewer,
  fetchWatchlistNewsFeedOlder,
} from '../data/clients/newsClient'
import { mapNewsFeedItems } from '../data/mappers/stockMapper'
import type { NewsFeedAroundResponse } from '../data/types/stockApi'
import type { AnchoredFeedPagination } from '../data/types/anchoredFeed'
import { ANCHORED_FEED_PAGE_LIMIT } from '../data/types/anchoredFeed'
import type { StockNewsItem, StockNewsPagination } from '../data/types/stock'
import {
  clearNewsFeedConsumedMemory,
  clearNewsFeedLiveSnapshot,
  consumeNewsFeedSession,
  registerNewsFeedLiveSnapshot,
  type NewsFeedMode,
} from '../lib/newsFeedSession'
import { useAuthStore } from '../store/authStore'
import { useAnchoredFeed } from './useAnchoredFeed'

export type { NewsFeedMode }

const EMPTY_PAGINATION: StockNewsPagination = {
  nextCursor: null,
  hasNext: false,
}

type FeedBootstrap = 'pending' | 'session' | 'anchored' | 'cursor'

function mapNewsFeedAroundPage(page: NewsFeedAroundResponse) {
  return {
    items: mapNewsFeedItems(page.items),
    pagination: {
      newerCursor: page.newerCursor ?? null,
      hasNewer: page.hasNewer ?? false,
      olderCursor: page.olderCursor ?? null,
      hasOlder: page.hasOlder ?? false,
    } satisfies AnchoredFeedPagination,
  }
}

export function useNewsFeedPage(mode: NewsFeedMode) {
  const [searchParams] = useSearchParams()
  const focusNewsId = searchParams.get('newsId')?.trim() || null
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const [bootstrap, setBootstrap] = useState<FeedBootstrap>('pending')
  const [loading, setLoading] = useState(true)
  const [loadingLatestMore, setLoadingLatestMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [restoredScrollTop, setRestoredScrollTop] = useState<number | null>(null)
  const requestIdRef = useRef(0)
  const restoredOnceRef = useRef(false)
  const focusNewsIdRef = useRef(focusNewsId)
  focusNewsIdRef.current = focusNewsId
  const [suppressAnchored, setSuppressAnchored] = useState(false)
  const suppressAnchoredRef = useRef(false)
  suppressAnchoredRef.current = suppressAnchored
  const [resettingToLatest, setResettingToLatest] = useState(false)

  const needsLogin = mode === 'watchlist' && !isLoggedIn
  const useAnchoredBootstrap = bootstrap === 'anchored' && !suppressAnchored

  const fetchAround = useCallback(
    async (newsId: string) => {
      const page =
        mode === 'watchlist'
          ? await fetchWatchlistNewsFeedAround(newsId, { limit: ANCHORED_FEED_PAGE_LIMIT })
          : await fetchAllNewsFeedAround(newsId, { limit: ANCHORED_FEED_PAGE_LIMIT })
      return mapNewsFeedAroundPage(page)
    },
    [mode],
  )

  const fetchNewer = useCallback(
    async (cursor: string) => {
      const page =
        mode === 'watchlist'
          ? await fetchWatchlistNewsFeedNewer({ cursor, limit: ANCHORED_FEED_PAGE_LIMIT })
          : await fetchAllNewsFeedNewer({ cursor, limit: ANCHORED_FEED_PAGE_LIMIT })
      return mapNewsFeedAroundPage(page)
    },
    [mode],
  )

  const fetchOlder = useCallback(
    async (cursor: string) => {
      const page =
        mode === 'watchlist'
          ? await fetchWatchlistNewsFeedOlder({ cursor, limit: ANCHORED_FEED_PAGE_LIMIT })
          : await fetchAllNewsFeedOlder({ cursor, limit: ANCHORED_FEED_PAGE_LIMIT })
      return mapNewsFeedAroundPage(page)
    },
    [mode],
  )

  const {
    items,
    feedMode,
    latestPagination: pagination,
    loadingAround,
    loadingNewer,
    loadingOlder,
    aroundError,
    anchoredWarmComplete,
    hasMoreDown,
    hasMoreUp,
    loadNewer,
    loadOlder,
    replaceLatestItems,
    appendLatestItems,
    cancelAroundLoad,
  } = useAnchoredFeed<StockNewsItem>({
    scopeKey: mode,
    anchorId: useAnchoredBootstrap ? focusNewsId : null,
    initialItems: [],
    initialLatestPagination: EMPTY_PAGINATION,
    anchoredEnabled: useAnchoredBootstrap,
    fetchAround,
    fetchNewer,
    fetchOlder,
  })

  useEffect(() => {
    if (needsLogin) {
      clearNewsFeedLiveSnapshot()
      return
    }
    registerNewsFeedLiveSnapshot({ mode, items, pagination })
  }, [needsLogin, mode, items, pagination])

  useEffect(() => {
    return () => {
      clearNewsFeedLiveSnapshot()
    }
  }, [])

  useEffect(() => {
    restoredOnceRef.current = false
    clearNewsFeedConsumedMemory()
    setSuppressAnchored(false)
    setBootstrap('pending')
  }, [mode])

  useEffect(() => {
    setSuppressAnchored(false)
    if (!focusNewsId) {
      clearNewsFeedConsumedMemory()
    }
  }, [focusNewsId])

  useEffect(() => {
    const requestId = ++requestIdRef.current
    let cancelled = false

    const run = async () => {
      if (needsLogin) {
        replaceLatestItems([], EMPTY_PAGINATION)
        setError(null)
        setLoadMoreError(null)
        setRestoredScrollTop(null)
        setBootstrap('cursor')
        setLoading(false)
        return
      }

      if (!restoredOnceRef.current) {
        const session = consumeNewsFeedSession(focusNewsIdRef.current, mode)
        if (session) {
          restoredOnceRef.current = true
          replaceLatestItems(session.items, session.pagination)
          setRestoredScrollTop(session.scrollTop)
          setError(null)
          setLoadMoreError(null)
          setBootstrap('session')
          setLoading(false)
          return
        }
      }

      setRestoredScrollTop(null)
      setError(null)
      setLoadMoreError(null)

      if (focusNewsIdRef.current && !suppressAnchoredRef.current) {
        setBootstrap('anchored')
        setLoading(false)
        return
      }

      setBootstrap('cursor')
      setLoading(true)
      try {
        const fetchPage =
          mode === 'watchlist' ? fetchWatchlistNewsFeedCursor : fetchAllNewsFeedCursor
        const page = await fetchPage({ limit: ANCHORED_FEED_PAGE_LIMIT })
        if (cancelled || requestId !== requestIdRef.current) return
        replaceLatestItems(page.items, page.pagination)
      } catch (e) {
        if (cancelled || requestId !== requestIdRef.current) return
        const fallback =
          mode === 'watchlist'
            ? '관심종목 뉴스를 불러오지 못했습니다.'
            : '전체 뉴스를 불러오지 못했습니다.'
        setError(e instanceof Error ? e.message : fallback)
        replaceLatestItems([], EMPTY_PAGINATION)
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [mode, needsLogin, focusNewsId, replaceLatestItems])

  const loadMore = useCallback(async () => {
    if (needsLogin) return

    if (feedMode === 'anchored') {
      setLoadMoreError(null)
      try {
        await loadOlder()
      } catch (e) {
        setLoadMoreError(
          e instanceof Error
            ? e.message
            : mode === 'watchlist'
              ? '관심종목 뉴스를 더 불러오지 못했습니다.'
              : '뉴스를 더 불러오지 못했습니다.',
        )
      }
      return
    }

    if (!pagination.hasNext || !pagination.nextCursor || loadingLatestMore) return
    setLoadingLatestMore(true)
    setLoadMoreError(null)
    try {
      const fetchPage =
        mode === 'watchlist' ? fetchWatchlistNewsFeedCursor : fetchAllNewsFeedCursor
      const page = await fetchPage({
        limit: ANCHORED_FEED_PAGE_LIMIT,
        cursor: pagination.nextCursor,
      })
      appendLatestItems(page.items, page.pagination)
    } catch (e) {
      setLoadMoreError(
        e instanceof Error
          ? e.message
          : mode === 'watchlist'
            ? '관심종목 뉴스를 더 불러오지 못했습니다.'
            : '뉴스를 더 불러오지 못했습니다.',
      )
    } finally {
      setLoadingLatestMore(false)
    }
  }, [
    needsLogin,
    feedMode,
    loadOlder,
    pagination,
    loadingLatestMore,
    mode,
    appendLatestItems,
  ])

  const resetToLatestFeed = useCallback(async () => {
    if (!focusNewsId || needsLogin) return

    cancelAroundLoad()
    setResettingToLatest(true)
    setSuppressAnchored(true)
    setBootstrap('cursor')
    setLoadMoreError(null)
    setRestoredScrollTop(null)
    try {
      const fetchPage =
        mode === 'watchlist' ? fetchWatchlistNewsFeedCursor : fetchAllNewsFeedCursor
      const page = await fetchPage({ limit: ANCHORED_FEED_PAGE_LIMIT })
      replaceLatestItems(page.items, page.pagination)
    } catch (e) {
      const fallback =
        mode === 'watchlist'
          ? '관심종목 뉴스 목록을 새로고침하지 못했습니다.'
          : '뉴스 목록을 새로고침하지 못했습니다.'
      setLoadMoreError(e instanceof Error ? e.message : fallback)
    } finally {
      setResettingToLatest(false)
    }
  }, [focusNewsId, needsLogin, cancelAroundLoad, mode, replaceLatestItems])

  const feedError = error ?? (useAnchoredBootstrap ? aroundError : null)
  const feedReady =
    !useAnchoredBootstrap || (anchoredWarmComplete && !loadingAround && !resettingToLatest)
  const loadingMore = feedMode === 'anchored' ? loadingOlder : loadingLatestMore
  const hasMore = feedMode === 'anchored' ? hasMoreDown : pagination.hasNext

  return {
    items,
    feedMode,
    pagination,
    loading:
      loading ||
      (useAnchoredBootstrap && loadingAround && items.length === 0) ||
      resettingToLatest,
    loadingMore,
    loadingAround,
    loadingNewer,
    error: feedError,
    loadMoreError,
    loadMore,
    loadNewer,
    needsLogin,
    restoredScrollTop,
    feedReady,
    hasMore,
    hasMoreDown,
    hasMoreUp,
    focusNewsId,
    resetToLatestFeed,
    resettingToLatest,
  }
}
