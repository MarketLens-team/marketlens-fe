import { useCallback, useEffect, useRef, useState } from 'react'

const SCROLL_ROOT_SELECTOR = 'main[data-scroll-root]'

/** 하단 무한 스크롤: 루트 뷰포트 아래 240px 전에 로드 트리거 */
const DEFAULT_ROOT_MARGIN_DOWN = '0px 0px 240px 0px'
/** 상단: 끝에 닿기 전 살짝 미리 로드 */
const DEFAULT_ROOT_MARGIN_UP = '120px 0px 0px 0px'
/** 연속 트리거 방지 — 빠른 스크롤 시 레이아웃 튐 완화 */
const DEFAULT_LOAD_COOLDOWN_MS = 400

export function getLayoutScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(SCROLL_ROOT_SELECTOR)
}

function parseRootMarginPx(rootMargin: string, edge: 'top' | 'bottom'): number {
  const parts = rootMargin.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 0
  const index = parts.length === 4 ? (edge === 'top' ? 0 : 2) : 0
  const value = parseFloat(parts[index] ?? '0')
  return Number.isFinite(value) ? value : 0
}

function isSentinelInLoadZone(
  sentinel: HTMLElement,
  root: HTMLElement | null,
  rootMargin: string,
  direction: 'up' | 'down',
): boolean {
  const rect = sentinel.getBoundingClientRect()
  const rootRect = (root ?? document.documentElement).getBoundingClientRect()

  if (direction === 'down') {
    const margin = parseRootMarginPx(rootMargin, 'bottom')
    return rect.top <= rootRect.bottom + margin
  }

  const margin = parseRootMarginPx(rootMargin, 'top')
  return rect.bottom >= rootRect.top - margin
}

interface UseInfiniteScrollOptions {
  enabled: boolean
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  rootMargin?: string
  /** `down`(기본): 하단 더보기 · `up`: 상단 더보기(anchored newer) */
  direction?: 'down' | 'up'
  /**
   * `up` 전용 — 프로그램 스크롤(포커스 점프)과 구분해
   * 사용자 휠·터치로 위로 스크롤한 뒤에만 트리거.
   */
  requireUserScrollUp?: boolean
  /** 기본값: Layout `main[data-scroll-root]`. 인물 상세 등 내부 스크롤 영역에 지정 */
  scrollRootSelector?: string
  /** 연속 loadMore 호출 최소 간격(ms) */
  loadCooldownMs?: number
}

export function useInfiniteScroll({
  enabled,
  hasMore,
  loading,
  onLoadMore,
  rootMargin,
  direction = 'down',
  requireUserScrollUp = false,
  scrollRootSelector,
  loadCooldownMs = DEFAULT_LOAD_COOLDOWN_MS,
}: UseInfiniteScrollOptions) {
  const resolvedRootMargin =
    rootMargin ?? (direction === 'up' ? DEFAULT_ROOT_MARGIN_UP : DEFAULT_ROOT_MARGIN_DOWN)
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  const userScrolledUpRef = useRef(false)
  const lastLoadStartedAtRef = useRef(0)
  const touchStartYRef = useRef(0)
  const wasLoadingRef = useRef(false)
  const postLoadRetryDoneRef = useRef(false)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    userScrolledUpRef.current = false
    lastLoadStartedAtRef.current = 0
    touchStartYRef.current = 0
    wasLoadingRef.current = false
    postLoadRetryDoneRef.current = false
  }, [enabled, requireUserScrollUp, direction])

  useEffect(() => {
    if (loading) postLoadRetryDoneRef.current = false
  }, [loading])

  const tryLoadMore = useCallback(() => {
    if (!enabled || !hasMore || loading) return false
    if (requireUserScrollUp && direction === 'up' && !userScrolledUpRef.current) return false

    const now = Date.now()
    if (now - lastLoadStartedAtRef.current < loadCooldownMs) return false

    lastLoadStartedAtRef.current = now
    onLoadMoreRef.current()
    return true
  }, [enabled, hasMore, loading, requireUserScrollUp, direction, loadCooldownMs])

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelEl(node)
  }, [])

  useEffect(() => {
    if (!enabled || !requireUserScrollUp || direction !== 'up') return

    const root = scrollRootSelector
      ? document.querySelector<HTMLElement>(scrollRootSelector)
      : getLayoutScrollRoot()
    if (!root) return

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) userScrolledUpRef.current = true
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? 0
    }

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? 0
      if (y > touchStartYRef.current + 12) userScrolledUpRef.current = true
    }

    root.addEventListener('wheel', onWheel, { passive: true })
    root.addEventListener('touchstart', onTouchStart, { passive: true })
    root.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      root.removeEventListener('wheel', onWheel)
      root.removeEventListener('touchstart', onTouchStart)
      root.removeEventListener('touchmove', onTouchMove)
    }
  }, [enabled, requireUserScrollUp, direction, scrollRootSelector])

  useEffect(() => {
    if (!enabled || !sentinelEl) return

    const root = scrollRootSelector
      ? document.querySelector<HTMLElement>(scrollRootSelector)
      : getLayoutScrollRoot()

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        tryLoadMore()
      },
      { root, rootMargin: resolvedRootMargin, threshold: 0 },
    )

    observer.observe(sentinelEl)
    return () => observer.disconnect()
  }, [
    enabled,
    resolvedRootMargin,
    scrollRootSelector,
    sentinelEl,
    tryLoadMore,
  ])

  /** IO가 재발화되지 않을 때 — 로드 1회 끝난 뒤 센티넬이 여전히 보이면 한 번만 재시도 */
  useEffect(() => {
    const wasLoading = wasLoadingRef.current
    wasLoadingRef.current = loading

    if (!wasLoading || loading || !enabled || !sentinelEl || !hasMore || postLoadRetryDoneRef.current) {
      return
    }

    const root = scrollRootSelector
      ? document.querySelector<HTMLElement>(scrollRootSelector)
      : getLayoutScrollRoot()

    const rafId = requestAnimationFrame(() => {
      if (postLoadRetryDoneRef.current) return
      if (!isSentinelInLoadZone(sentinelEl, root, resolvedRootMargin, direction)) return
      postLoadRetryDoneRef.current = true
      tryLoadMore()
    })

    return () => cancelAnimationFrame(rafId)
  }, [
    loading,
    enabled,
    sentinelEl,
    hasMore,
    scrollRootSelector,
    resolvedRootMargin,
    direction,
    tryLoadMore,
  ])

  return sentinelRef
}
