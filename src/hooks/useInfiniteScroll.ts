import { useCallback, useEffect, useRef, useState } from 'react'

const SCROLL_ROOT_SELECTOR = 'main[data-scroll-root]'

/** 하단 무한 스크롤: 루트 뷰포트 아래 240px 전에 로드 트리거 */
const DEFAULT_ROOT_MARGIN_DOWN = '0px 0px 240px 0px'
/** 상단 newer — 과도한 prefetch 방지 */
const DEFAULT_ROOT_MARGIN_UP = '64px 0px 0px 0px'
/** 연속 트리거 방지 */
const DEFAULT_LOAD_COOLDOWN_MS = 400
/** 빠른 휠/터치 시 newer 연속 호출 완화 */
const SCROLL_UP_ATTEMPT_THROTTLE_MS = 200
/** 빠른 위 스크롤 — 휠 이벤트 연속 시 마지막 한 번만 로드 시도 */
/** 스크롤이 잠깐 멈춘 뒤 newer 요청 — API 응답 전 추가 스크롤과 보정 충돌 완화 */
const SCROLL_UP_LOAD_DEBOUNCE_MS = 260
/** 로드 직후 센티넬 재시도 — 스크롤 관성·레이아웃 안정 대기 */
const POST_LOAD_RETRY_DELAY_MS = 150

export function getLayoutScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(SCROLL_ROOT_SELECTOR)
}

export function resolveScrollRoot(scrollRootSelector?: string): HTMLElement | null {
  const q = scrollRootSelector?.trim()
  if (q) return document.querySelector<HTMLElement>(q)
  return getLayoutScrollRoot()
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
  direction?: 'up' | 'down'
  /**
   * `up` 전용 — 사용자가 위로 스크롤하는 동작이 있을 때만 로드.
   * prepend·포커스 점프만으로는 트리거하지 않음.
   */
  requireUserScrollUp?: boolean
  scrollRootSelector?: string
  loadCooldownMs?: number
  /** true면 로드 직후 센티넬 자동 재시도 안 함 (anchored 빠른 스크롤) */
  disablePostLoadRetry?: boolean
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
  disablePostLoadRetry = false,
}: UseInfiniteScrollOptions) {
  const resolvedRootMargin =
    rootMargin ?? (direction === 'up' ? DEFAULT_ROOT_MARGIN_UP : DEFAULT_ROOT_MARGIN_DOWN)
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  const userScrolledUpRef = useRef(false)
  const lastLoadStartedAtRef = useRef(0)
  const lastScrollUpAttemptAtRef = useRef(0)
  const touchStartYRef = useRef(0)
  const wasLoadingRef = useRef(false)
  const loadingRef = useRef(loading)
  const scrollUpLoadDebounceIdRef = useRef<number | undefined>(undefined)

  loadingRef.current = loading

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    userScrolledUpRef.current = false
    lastLoadStartedAtRef.current = 0
    touchStartYRef.current = 0
    wasLoadingRef.current = false
    if (scrollUpLoadDebounceIdRef.current != null) {
      window.clearTimeout(scrollUpLoadDebounceIdRef.current)
      scrollUpLoadDebounceIdRef.current = undefined
    }
  }, [enabled, requireUserScrollUp, direction])

  const resolveRoot = useCallback(() => resolveScrollRoot(scrollRootSelector), [scrollRootSelector])

  const tryLoadMore = useCallback(() => {
    if (!enabled || !hasMore) return false
    if (loading || loadingRef.current) return false
    if (requireUserScrollUp && direction === 'up' && !userScrolledUpRef.current) return false

    const now = Date.now()
    if (now - lastLoadStartedAtRef.current < loadCooldownMs) return false

    lastLoadStartedAtRef.current = now
    if (direction === 'up') {
      userScrolledUpRef.current = false
    }
    onLoadMoreRef.current()
    return true
  }, [enabled, hasMore, loading, requireUserScrollUp, direction, loadCooldownMs])

  /** up: 위로 스크롤 + 센티넬이 상단 존에 있을 때만 (연속 위 스크롤 시 페이지마다 로드) */
  const attemptUpLoad = useCallback(() => {
    if (direction !== 'up' || !sentinelEl) return false
    const now = Date.now()
    if (now - lastScrollUpAttemptAtRef.current < SCROLL_UP_ATTEMPT_THROTTLE_MS) return false
    lastScrollUpAttemptAtRef.current = now
    const root = resolveRoot()
    if (!isSentinelInLoadZone(sentinelEl, root, resolvedRootMargin, 'up')) return false
    return tryLoadMore()
  }, [direction, sentinelEl, resolveRoot, resolvedRootMargin, tryLoadMore])

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelEl(node)
  }, [])

  useEffect(() => {
    if (!enabled || direction !== 'up' || !requireUserScrollUp) return

    const root = resolveRoot()
    if (!root) return

    const scheduleUpLoadAfterScroll = () => {
      if (scrollUpLoadDebounceIdRef.current != null) {
        window.clearTimeout(scrollUpLoadDebounceIdRef.current)
      }
      scrollUpLoadDebounceIdRef.current = window.setTimeout(() => {
        scrollUpLoadDebounceIdRef.current = undefined
        attemptUpLoad()
      }, SCROLL_UP_LOAD_DEBOUNCE_MS)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY >= 0) return
      userScrolledUpRef.current = true
      scheduleUpLoadAfterScroll()
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? 0
    }

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? 0
      if (y <= touchStartYRef.current + 12) return
      userScrolledUpRef.current = true
      scheduleUpLoadAfterScroll()
    }

    root.addEventListener('wheel', onWheel, { passive: true })
    root.addEventListener('touchstart', onTouchStart, { passive: true })
    root.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      if (scrollUpLoadDebounceIdRef.current != null) {
        window.clearTimeout(scrollUpLoadDebounceIdRef.current)
        scrollUpLoadDebounceIdRef.current = undefined
      }
      root.removeEventListener('wheel', onWheel)
      root.removeEventListener('touchstart', onTouchStart)
      root.removeEventListener('touchmove', onTouchMove)
    }
  }, [enabled, requireUserScrollUp, direction, resolveRoot, attemptUpLoad])

  useEffect(() => {
    if (!enabled || !sentinelEl) return

    const root = resolveRoot()

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        if (direction === 'up' && requireUserScrollUp) {
          attemptUpLoad()
          return
        }
        tryLoadMore()
      },
      { root, rootMargin: resolvedRootMargin, threshold: 0 },
    )

    observer.observe(sentinelEl)
    return () => observer.disconnect()
  }, [
    enabled,
    resolvedRootMargin,
    resolveRoot,
    sentinelEl,
    tryLoadMore,
    attemptUpLoad,
    direction,
    requireUserScrollUp,
  ])

  /** down 전용 — 로드 후 센티넬이 여전히 보이면 1회 재시도 */
  useEffect(() => {
    if (direction === 'up' || disablePostLoadRetry) return

    const wasLoading = wasLoadingRef.current
    wasLoadingRef.current = loading

    if (!wasLoading || loading || !enabled || !sentinelEl || !hasMore) return

    const root = resolveRoot()

    const timeoutId = window.setTimeout(() => {
      if (loadingRef.current) return
      if (!isSentinelInLoadZone(sentinelEl, root, resolvedRootMargin, direction)) return
      tryLoadMore()
    }, POST_LOAD_RETRY_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [
    loading,
    enabled,
    sentinelEl,
    hasMore,
    resolveRoot,
    resolvedRootMargin,
    direction,
    tryLoadMore,
    disablePostLoadRetry,
  ])

  return sentinelRef
}
