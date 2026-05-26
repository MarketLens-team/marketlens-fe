import { useCallback, useEffect, useRef, useState } from 'react'

const SCROLL_ROOT_SELECTOR = 'main[data-scroll-root]'

/** 하단 무한 스크롤: 루트 뷰포트 아래 240px 전에 로드 트리거 */
const DEFAULT_ROOT_MARGIN_DOWN = '0px 0px 240px 0px'
/** 상단 무한 스크롤: 루트 뷰포트 위 240px 전에 로드 트리거 */
const DEFAULT_ROOT_MARGIN_UP = '240px 0px 0px 0px'

export function getLayoutScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(SCROLL_ROOT_SELECTOR)
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
   * `up` 전용 — 마운트 직후 센티넬 교차로 자동 로드하지 않음.
   * 사용자가 스크롤 루트에서 위로 스크롤한 뒤에만 트리거.
   */
  requireUserScrollUp?: boolean
  /** 기본값: Layout `main[data-scroll-root]`. 인물 상세 등 내부 스크롤 영역에 지정 */
  scrollRootSelector?: string
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
}: UseInfiniteScrollOptions) {
  const resolvedRootMargin =
    rootMargin ?? (direction === 'up' ? DEFAULT_ROOT_MARGIN_UP : DEFAULT_ROOT_MARGIN_DOWN)
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  const userScrolledUpRef = useRef(false)
  const lastScrollTopRef = useRef(0)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    userScrolledUpRef.current = false
    lastScrollTopRef.current = 0
  }, [enabled, requireUserScrollUp, direction])

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelEl(node)
  }, [])

  useEffect(() => {
    if (!enabled || !requireUserScrollUp || direction !== 'up') return

    const root = scrollRootSelector
      ? document.querySelector<HTMLElement>(scrollRootSelector)
      : getLayoutScrollRoot()
    if (!root) return

    lastScrollTopRef.current = root.scrollTop

    const onScroll = () => {
      const scrollTop = root.scrollTop
      if (scrollTop < lastScrollTopRef.current - 8) {
        userScrolledUpRef.current = true
      }
      lastScrollTopRef.current = scrollTop
    }

    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [enabled, requireUserScrollUp, direction, scrollRootSelector])

  useEffect(() => {
    if (!enabled || !sentinelEl) return

    const root = scrollRootSelector
      ? document.querySelector<HTMLElement>(scrollRootSelector)
      : getLayoutScrollRoot()

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        if (!hasMore || loading) return
        if (requireUserScrollUp && direction === 'up' && !userScrolledUpRef.current) return
        onLoadMoreRef.current()
      },
      { root, rootMargin: resolvedRootMargin, threshold: 0 },
    )

    observer.observe(sentinelEl)
    return () => observer.disconnect()
  }, [
    enabled,
    hasMore,
    loading,
    resolvedRootMargin,
    scrollRootSelector,
    sentinelEl,
    requireUserScrollUp,
    direction,
  ])

  return sentinelRef
}
