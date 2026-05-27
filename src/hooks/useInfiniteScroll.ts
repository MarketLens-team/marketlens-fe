import { useCallback, useEffect, useRef, useState } from 'react'

const SCROLL_ROOT_SELECTOR = 'main[data-scroll-root]'

/** 하단 무한 스크롤: 루트 뷰포트 아래 240px 전에 로드 트리거 */
const DEFAULT_ROOT_MARGIN_DOWN = '0px 0px 240px 0px'
/** 상단 newer — 과도한 prefetch 방지 */
const DEFAULT_ROOT_MARGIN_UP = '64px 0px 0px 0px'
/** 연속 트리거 방지 */
const DEFAULT_LOAD_COOLDOWN_MS = 400
/** 빠른 휠/터치 시 newer·older 연속 호출 완화 */
const SCROLL_DIRECTION_ATTEMPT_THROTTLE_MS = 200
/** 스크롤이 잠깐 멈춘 뒤 로드 — API 응답 전 추가 스크롤과 보정 충돌 완화 */
const SCROLL_DIRECTION_LOAD_DEBOUNCE_MS = 260
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
  /**
   * `down` 전용 — 사용자가 아래로 스크롤하는 동작이 있을 때만 로드.
   * anchored older가 센티넬 prefetch만으로 연속 호출되는 것을 방지.
   */
  requireUserScrollDown?: boolean
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
  requireUserScrollDown = false,
  scrollRootSelector,
  loadCooldownMs = DEFAULT_LOAD_COOLDOWN_MS,
  disablePostLoadRetry = false,
}: UseInfiniteScrollOptions) {
  const resolvedRootMargin =
    rootMargin ?? (direction === 'up' ? DEFAULT_ROOT_MARGIN_UP : DEFAULT_ROOT_MARGIN_DOWN)
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  const userScrolledUpRef = useRef(false)
  const userScrolledDownRef = useRef(false)
  const lastLoadStartedAtRef = useRef(0)
  const lastDirectionAttemptAtRef = useRef(0)
  const touchStartYRef = useRef(0)
  const wasLoadingRef = useRef(false)
  const loadingRef = useRef(loading)
  const enabledRef = useRef(enabled)
  const hasMoreRef = useRef(hasMore)
  const directionRef = useRef(direction)
  const requireUserScrollUpRef = useRef(requireUserScrollUp)
  const requireUserScrollDownRef = useRef(requireUserScrollDown)
  const loadCooldownMsRef = useRef(loadCooldownMs)
  const resolvedRootMarginRef = useRef(resolvedRootMargin)
  const scrollDirectionLoadDebounceIdRef = useRef<number | undefined>(undefined)
  const sentinelElRef = useRef(sentinelEl)

  loadingRef.current = loading
  enabledRef.current = enabled
  hasMoreRef.current = hasMore
  directionRef.current = direction
  requireUserScrollUpRef.current = requireUserScrollUp
  requireUserScrollDownRef.current = requireUserScrollDown
  loadCooldownMsRef.current = loadCooldownMs
  resolvedRootMarginRef.current = resolvedRootMargin
  sentinelElRef.current = sentinelEl

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    userScrolledUpRef.current = false
    userScrolledDownRef.current = false
    lastLoadStartedAtRef.current = 0
    touchStartYRef.current = 0
    wasLoadingRef.current = false
    if (scrollDirectionLoadDebounceIdRef.current != null) {
      window.clearTimeout(scrollDirectionLoadDebounceIdRef.current)
      scrollDirectionLoadDebounceIdRef.current = undefined
    }
  }, [enabled, requireUserScrollUp, requireUserScrollDown, direction])

  const resolveRoot = useCallback(() => resolveScrollRoot(scrollRootSelector), [scrollRootSelector])

  const tryLoadMoreRef = useRef<() => boolean>(() => false)
  tryLoadMoreRef.current = () => {
    if (!enabledRef.current || !hasMoreRef.current) return false
    if (loadingRef.current) return false
    if (
      requireUserScrollUpRef.current &&
      directionRef.current === 'up' &&
      !userScrolledUpRef.current
    ) {
      return false
    }
    if (
      requireUserScrollDownRef.current &&
      directionRef.current === 'down' &&
      !userScrolledDownRef.current
    ) {
      return false
    }

    const now = Date.now()
    if (now - lastLoadStartedAtRef.current < loadCooldownMsRef.current) return false

    lastLoadStartedAtRef.current = now
    if (directionRef.current === 'up') {
      userScrolledUpRef.current = false
    }
    if (directionRef.current === 'down') {
      userScrolledDownRef.current = false
    }
    onLoadMoreRef.current()
    return true
  }

  const attemptDirectionalLoadRef = useRef<() => boolean>(() => false)
  attemptDirectionalLoadRef.current = () => {
    const dir = directionRef.current
    const sentinel = sentinelElRef.current
    if (!sentinel || (dir !== 'up' && dir !== 'down')) return false

    const now = Date.now()
    if (now - lastDirectionAttemptAtRef.current < SCROLL_DIRECTION_ATTEMPT_THROTTLE_MS) {
      return false
    }
    lastDirectionAttemptAtRef.current = now

    const root = resolveScrollRoot(scrollRootSelector)
    if (!isSentinelInLoadZone(sentinel, root, resolvedRootMarginRef.current, dir)) {
      return false
    }
    return tryLoadMoreRef.current()
  }

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelEl(node)
  }, [])

  useEffect(() => {
    const needsScrollIntent =
      (direction === 'up' && requireUserScrollUp) ||
      (direction === 'down' && requireUserScrollDown)
    if (!enabled || !needsScrollIntent) return

    const root = resolveRoot()
    if (!root) return

    const scheduleDirectionalLoadAfterScroll = () => {
      if (scrollDirectionLoadDebounceIdRef.current != null) {
        window.clearTimeout(scrollDirectionLoadDebounceIdRef.current)
      }
      scrollDirectionLoadDebounceIdRef.current = window.setTimeout(() => {
        scrollDirectionLoadDebounceIdRef.current = undefined
        attemptDirectionalLoadRef.current()
      }, SCROLL_DIRECTION_LOAD_DEBOUNCE_MS)
    }

    const onWheel = (event: WheelEvent) => {
      if (direction === 'up' && event.deltaY < 0) {
        userScrolledUpRef.current = true
        scheduleDirectionalLoadAfterScroll()
        return
      }
      if (direction === 'down' && event.deltaY > 0) {
        userScrolledDownRef.current = true
        scheduleDirectionalLoadAfterScroll()
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? 0
    }

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? 0
      if (direction === 'up' && y > touchStartYRef.current + 12) {
        userScrolledUpRef.current = true
        scheduleDirectionalLoadAfterScroll()
        return
      }
      if (direction === 'down' && y < touchStartYRef.current - 12) {
        userScrolledDownRef.current = true
        scheduleDirectionalLoadAfterScroll()
      }
    }

    root.addEventListener('wheel', onWheel, { passive: true })
    root.addEventListener('touchstart', onTouchStart, { passive: true })
    root.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      if (scrollDirectionLoadDebounceIdRef.current != null) {
        window.clearTimeout(scrollDirectionLoadDebounceIdRef.current)
        scrollDirectionLoadDebounceIdRef.current = undefined
      }
      root.removeEventListener('wheel', onWheel)
      root.removeEventListener('touchstart', onTouchStart)
      root.removeEventListener('touchmove', onTouchMove)
    }
  }, [
    enabled,
    requireUserScrollUp,
    requireUserScrollDown,
    direction,
    resolveRoot,
    scrollRootSelector,
  ])

  useEffect(() => {
    if (!enabled || !sentinelEl) return

    const root = resolveRoot()

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        if (direction === 'up' && requireUserScrollUp) {
          attemptDirectionalLoadRef.current()
          return
        }
        if (direction === 'down' && requireUserScrollDown) {
          attemptDirectionalLoadRef.current()
          return
        }
        tryLoadMoreRef.current()
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
    direction,
    requireUserScrollUp,
    requireUserScrollDown,
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
      if (
        !isSentinelInLoadZone(sentinelEl, root, resolvedRootMarginRef.current, direction)
      ) {
        return
      }
      tryLoadMoreRef.current()
    }, POST_LOAD_RETRY_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [
    loading,
    enabled,
    sentinelEl,
    hasMore,
    resolveRoot,
    direction,
    disablePostLoadRetry,
  ])

  return sentinelRef
}
