import { useCallback, useEffect, useRef, useState } from 'react'

const SCROLL_ROOT_SELECTOR = 'main[data-scroll-root]'

/** 하단 무한 스크롤: 루트 뷰포트 아래 240px 전에 로드 트리거 */
const DEFAULT_ROOT_MARGIN = '0px 0px 240px 0px'

export function getLayoutScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(SCROLL_ROOT_SELECTOR)
}

interface UseInfiniteScrollOptions {
  enabled: boolean
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  rootMargin?: string
  /** 기본값: Layout `main[data-scroll-root]`. 인물 상세 등 내부 스크롤 영역에 지정 */
  scrollRootSelector?: string
}

export function useInfiniteScroll({
  enabled,
  hasMore,
  loading,
  onLoadMore,
  rootMargin = DEFAULT_ROOT_MARGIN,
  scrollRootSelector,
}: UseInfiniteScrollOptions) {
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelEl(node)
  }, [])

  useEffect(() => {
    if (!enabled || !sentinelEl) return

    const root = scrollRootSelector
      ? document.querySelector<HTMLElement>(scrollRootSelector)
      : getLayoutScrollRoot()

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        if (!hasMore || loading) return
        onLoadMoreRef.current()
      },
      { root, rootMargin, threshold: 0 },
    )

    observer.observe(sentinelEl)
    return () => observer.disconnect()
  }, [enabled, hasMore, loading, rootMargin, scrollRootSelector, sentinelEl])

  return sentinelRef
}
