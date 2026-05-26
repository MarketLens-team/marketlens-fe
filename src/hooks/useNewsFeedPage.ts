import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchAllNewsFeedCursor,
  fetchWatchlistNewsFeedCursor,
} from '../data/clients/newsClient'
import type { StockNewsItem, StockNewsPagination } from '../data/types/stock'
import { useAuthStore } from '../store/authStore'

const EMPTY_PAGINATION: StockNewsPagination = {
  nextCursor: null,
  hasNext: false,
}

export type NewsFeedMode = 'all' | 'watchlist'

export function useNewsFeedPage(mode: NewsFeedMode) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const [items, setItems] = useState<StockNewsItem[]>([])
  const [pagination, setPagination] = useState<StockNewsPagination>(EMPTY_PAGINATION)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const needsLogin = mode === 'watchlist' && !isLoggedIn

  useEffect(() => {
    const requestId = ++requestIdRef.current
    let cancelled = false

    const run = async () => {
      if (needsLogin) {
        setItems([])
        setPagination(EMPTY_PAGINATION)
        setError(null)
        setLoadMoreError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      setLoadMoreError(null)
      try {
        const fetchPage =
          mode === 'watchlist' ? fetchWatchlistNewsFeedCursor : fetchAllNewsFeedCursor
        const page = await fetchPage({ limit: 20 })
        if (cancelled || requestId !== requestIdRef.current) return
        setItems(page.items)
        setPagination(page.pagination)
      } catch (e) {
        if (cancelled || requestId !== requestIdRef.current) return
        const fallback =
          mode === 'watchlist'
            ? '관심종목 뉴스를 불러오지 못했습니다.'
            : '전체 뉴스를 불러오지 못했습니다.'
        setError(e instanceof Error ? e.message : fallback)
        setItems([])
        setPagination(EMPTY_PAGINATION)
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
  }, [mode, needsLogin])

  const loadMore = useCallback(async () => {
    if (needsLogin || !pagination.hasNext || !pagination.nextCursor || loadingMore) return
    setLoadingMore(true)
    setLoadMoreError(null)
    try {
      const fetchPage =
        mode === 'watchlist' ? fetchWatchlistNewsFeedCursor : fetchAllNewsFeedCursor
      const page = await fetchPage({
        limit: 20,
        cursor: pagination.nextCursor,
      })
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id))
        const next = page.items.filter((item) => !seen.has(item.id))
        return [...prev, ...next]
      })
      setPagination(page.pagination)
    } catch (e) {
      setLoadMoreError(
        e instanceof Error
          ? e.message
          : mode === 'watchlist'
            ? '관심종목 뉴스를 더 불러오지 못했습니다.'
            : '뉴스를 더 불러오지 못했습니다.',
      )
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, mode, needsLogin, pagination.hasNext, pagination.nextCursor])

  return {
    items,
    pagination,
    loading,
    loadingMore,
    error,
    loadMoreError,
    loadMore,
    needsLogin,
  }
}
