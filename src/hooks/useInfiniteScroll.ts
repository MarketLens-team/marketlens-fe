import { useEffect, useRef } from 'react'

const SCROLL_ROOT_SELECTOR = 'main[data-scroll-root]'

export function getLayoutScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(SCROLL_ROOT_SELECTOR)
}

interface UseInfiniteScrollOptions {
  enabled: boolean
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  rootMargin?: string
}

export function useInfiniteScroll({
  enabled,
  hasMore,
  loading,
  onLoadMore,
  rootMargin = '240px 0px 0px',
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    if (!enabled) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const root = getLayoutScrollRoot()
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        if (!hasMore || loading) return
        onLoadMoreRef.current()
      },
      { root, rootMargin, threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled, hasMore, loading, rootMargin])

  return sentinelRef
}
