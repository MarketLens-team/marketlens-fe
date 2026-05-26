import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getLayoutScrollRoot } from './useInfiniteScroll'
import { scrollNewsFeedItemIntoView } from '../lib/newsFeedFocus'

interface NewsFeedItemWithId {
  id: string
}

const SCROLL_RETRY_COUNT = 10
const SCROLL_RETRY_MS = 80

interface UseNewsFeedFocusOptions {
  loading?: boolean
  /** cursor(latest) 모드에서만 — anchored는 around로 대상 로드 */
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void | Promise<void>
  /** sessionStorage 복원 시 저장된 scrollTop */
  restoredScrollTop?: number | null
}

/** `/news?newsId=` — 종목 상세에서 복귀 시 해당 기사 강조·위치 복원 (클릭해도 쿼리 유지) */
export function useNewsFeedFocus(items: NewsFeedItemWithId[], options?: UseNewsFeedFocusOptions) {
  const [searchParams] = useSearchParams()
  const focusNewsId = searchParams.get('newsId')?.trim() || null
  const loading = options?.loading ?? false
  const hasMore = options?.hasMore ?? false
  const loadingMore = options?.loadingMore ?? false
  const onLoadMore = options?.onLoadMore
  const restoredScrollTop = options?.restoredScrollTop
  const didScrollToFocusRef = useRef<string | null>(null)
  const didRestoreScrollRef = useRef(false)

  const hasTarget = Boolean(focusNewsId && items.some((item) => item.id === focusNewsId))

  useEffect(() => {
    didScrollToFocusRef.current = null
    didRestoreScrollRef.current = false
  }, [focusNewsId])

  useEffect(() => {
    if (restoredScrollTop == null || didRestoreScrollRef.current) return
    if (loading) return

    const root = getLayoutScrollRoot()
    if (!root) return

    didRestoreScrollRef.current = true
    root.scrollTo({ top: Math.max(0, restoredScrollTop), behavior: 'instant' })
    if (focusNewsId) {
      didScrollToFocusRef.current = focusNewsId
    }
  }, [restoredScrollTop, loading, focusNewsId])

  useEffect(() => {
    if (restoredScrollTop != null) return
    if (!focusNewsId || loading || hasTarget) return
    if (!hasMore || !onLoadMore) return
    if (loadingMore) return
    void onLoadMore()
  }, [
    restoredScrollTop,
    focusNewsId,
    loading,
    loadingMore,
    hasTarget,
    hasMore,
    onLoadMore,
  ])

  useEffect(() => {
    if (restoredScrollTop != null) return
    if (!focusNewsId || loading || !hasTarget) return
    if (didScrollToFocusRef.current === focusNewsId) return

    let cancelled = false
    let timeoutId: number | undefined
    let rafId = 0

    const attemptScroll = (triesLeft: number) => {
      if (cancelled) return
      if (scrollNewsFeedItemIntoView(focusNewsId)) {
        didScrollToFocusRef.current = focusNewsId
        return
      }
      if (triesLeft > 0) {
        timeoutId = window.setTimeout(() => attemptScroll(triesLeft - 1), SCROLL_RETRY_MS)
      }
    }

    rafId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => attemptScroll(SCROLL_RETRY_COUNT))
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(rafId)
      if (timeoutId != null) window.clearTimeout(timeoutId)
    }
  }, [restoredScrollTop, focusNewsId, items, loading, hasTarget])

  const isNewsFocused = useCallback(
    (newsId: string) => focusNewsId === newsId,
    [focusNewsId],
  )

  return { focusNewsId, isNewsFocused }
}
