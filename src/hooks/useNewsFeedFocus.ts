import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getLayoutScrollRoot } from './useInfiniteScroll'
import { newsFeedItemElementId, scrollNewsFeedItemIntoView } from '../lib/newsFeedFocus'

interface NewsFeedItemWithId {
  id: string
}

const MAX_AUTO_LOAD_ATTEMPTS = 12
const SCROLL_RETRY_COUNT = 10
const SCROLL_RETRY_MS = 80

interface UseNewsFeedFocusOptions {
  loading?: boolean
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void | Promise<void>
  /** sessionStorage 복원 시 저장된 scrollTop — cursor 연쇄 로드 대신 사용 */
  restoredScrollTop?: number | null
}

/** `/news?newsId=` — 종목 상세에서 뒤로 왔을 때 해당 기사 강조·위치 복원 */
export function useNewsFeedFocus(items: NewsFeedItemWithId[], options?: UseNewsFeedFocusOptions) {
  const [searchParams, setSearchParams] = useSearchParams()
  const focusNewsId = searchParams.get('newsId')?.trim() || null
  const loading = options?.loading ?? false
  const hasMore = options?.hasMore ?? false
  const loadingMore = options?.loadingMore ?? false
  const onLoadMore = options?.onLoadMore
  const restoredScrollTop = options?.restoredScrollTop
  const loadAttemptsRef = useRef(0)
  const didScrollToFocusRef = useRef<string | null>(null)
  const didRestoreScrollRef = useRef(false)

  const clearFocusNews = useCallback(() => {
    if (!searchParams.has('newsId')) return
    const next = new URLSearchParams(searchParams)
    next.delete('newsId')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const hasTarget = Boolean(focusNewsId && items.some((item) => item.id === focusNewsId))

  useEffect(() => {
    loadAttemptsRef.current = 0
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
    if (!hasMore || !onLoadMore || loadAttemptsRef.current >= MAX_AUTO_LOAD_ATTEMPTS) return
    if (loadingMore) return
    loadAttemptsRef.current += 1
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

  useEffect(() => {
    if (!focusNewsId) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const focusedEl = document.getElementById(newsFeedItemElementId(focusNewsId))
      if (focusedEl?.contains(target)) return
      clearFocusNews()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [focusNewsId, clearFocusNews])

  const isNewsFocused = useCallback(
    (newsId: string) => focusNewsId === newsId,
    [focusNewsId],
  )

  return { focusNewsId, clearFocusNews, isNewsFocused }
}
