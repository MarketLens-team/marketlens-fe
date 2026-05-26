import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ANCHORED_FEED_MAX_PREFETCH_PAGES,
  ANCHORED_FEED_PAGE_LIMIT,
  ANCHORED_WARM_MAX_ROUNDS,
  EMPTY_ANCHORED_PAGINATION,
  type AnchoredFeedPagination,
  type FeedMode,
} from '../data/types/anchoredFeed'
import { shouldWarmAnchoredViewport } from '../lib/anchoredFeedMeasure'
import { mergeFeedItemsById, mergeFeedItemsWithCount } from '../lib/mergeFeedItems'
import {
  capturePrependScrollSnapshot,
  schedulePrependScrollRestore,
  type PrependScrollSnapshot,
} from '../lib/preserveScrollOnPrepend'
import { getLayoutScrollRoot } from './useInfiniteScroll'

interface LatestPagination {
  nextCursor: string | null
  hasNext: boolean
}

interface AnchoredFeedPage<TItem> {
  items: TItem[]
  pagination: AnchoredFeedPagination
}

interface UseAnchoredFeedOptions<TItem> {
  /** 종목 코드·인물 ID 등 — 변경 시 latest 초기화 */
  scopeKey: string
  anchorId: string | null
  initialItems: TItem[]
  initialLatestPagination: LatestPagination
  /** anchored 모드 비활성(예: mock·필터) */
  anchoredEnabled?: boolean
  pageLimit?: number
  fetchAround: (anchorId: string) => Promise<AnchoredFeedPage<TItem>>
  fetchNewer: (cursor: string) => Promise<AnchoredFeedPage<TItem>>
  fetchOlder: (cursor: string) => Promise<AnchoredFeedPage<TItem>>
}

function shouldPrefetchNextPage(batchSize: number, pageLimit: number, hasMore: boolean) {
  return batchSize > 0 && batchSize < pageLimit && hasMore
}

export function useAnchoredFeed<TItem extends { id: string }>({
  scopeKey,
  anchorId,
  initialItems,
  initialLatestPagination,
  anchoredEnabled = true,
  pageLimit = ANCHORED_FEED_PAGE_LIMIT,
  fetchAround,
  fetchNewer,
  fetchOlder,
}: UseAnchoredFeedOptions<TItem>) {
  const [items, setItems] = useState(initialItems)
  const [feedMode, setFeedMode] = useState<FeedMode>('latest')
  const [latestPagination, setLatestPagination] = useState(initialLatestPagination)
  const [anchoredPagination, setAnchoredPagination] =
    useState<AnchoredFeedPagination>(EMPTY_ANCHORED_PAGINATION)
  const [loadingAround, setLoadingAround] = useState(false)
  const [loadingNewer, setLoadingNewer] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [aroundError, setAroundError] = useState<string | null>(null)
  const [anchoredWarmComplete, setAnchoredWarmComplete] = useState(() => !anchoredEnabled)

  const aroundRequestRef = useRef(0)
  const feedModeRef = useRef<FeedMode>('latest')
  const loadNewerInFlightRef = useRef(false)
  const loadOlderInFlightRef = useRef(false)
  const lastNewerCursorFetchedRef = useRef<string | null>(null)
  const lastOlderCursorFetchedRef = useRef<string | null>(null)
  const initialSnapshotRef = useRef({ items: initialItems, pagination: initialLatestPagination })
  const latestSyncKeyRef = useRef<string | null>(null)
  const anchoredPaginationRef = useRef(anchoredPagination)

  initialSnapshotRef.current = { items: initialItems, pagination: initialLatestPagination }
  anchoredPaginationRef.current = anchoredPagination
  feedModeRef.current = feedMode

  const fetchAroundRef = useRef(fetchAround)
  const fetchNewerRef = useRef(fetchNewer)
  const fetchOlderRef = useRef(fetchOlder)
  fetchAroundRef.current = fetchAround
  fetchNewerRef.current = fetchNewer
  fetchOlderRef.current = fetchOlder

  const resetToLatest = useCallback((nextItems: TItem[], pagination: LatestPagination) => {
    setFeedMode('latest')
    setItems(nextItems)
    setLatestPagination(pagination)
    setAnchoredPagination(EMPTY_ANCHORED_PAGINATION)
    setAroundError(null)
    lastNewerCursorFetchedRef.current = null
    lastOlderCursorFetchedRef.current = null
  }, [])

  const scopeKeyRef = useRef(scopeKey)
  useEffect(() => {
    const scopeChanged = scopeKeyRef.current !== scopeKey
    scopeKeyRef.current = scopeKey
    latestSyncKeyRef.current = null
    if (scopeChanged) {
      resetToLatest(initialSnapshotRef.current.items, initialSnapshotRef.current.pagination)
    }
  }, [scopeKey, resetToLatest])

  useEffect(() => {
    if (anchorId && anchoredEnabled) return

    const syncKey = [
      scopeKey,
      initialLatestPagination.nextCursor ?? '',
      String(initialLatestPagination.hasNext),
      initialItems.map((item) => item.id).join(','),
    ].join('|')

    if (latestSyncKeyRef.current === syncKey) return
    latestSyncKeyRef.current = syncKey
    resetToLatest(initialItems, initialLatestPagination)
  }, [
    scopeKey,
    anchorId,
    anchoredEnabled,
    initialItems,
    initialLatestPagination,
    resetToLatest,
  ])

  const applyNewerPage = useCallback(
    (page: AnchoredFeedPage<TItem>, scrollSnapshot: PrependScrollSnapshot | null) => {
      if (page.items.length === 0) {
        const nextPagination = { ...page.pagination, hasNewer: false, newerCursor: null }
        setAnchoredPagination(nextPagination)
        anchoredPaginationRef.current = nextPagination
        return 0
      }

      let added = 0
      setItems((prev) => {
        const merged = mergeFeedItemsWithCount(prev, page.items, 'prepend')
        added = merged.added
        return merged.items
      })
      setAnchoredPagination(page.pagination)
      anchoredPaginationRef.current = page.pagination

      const scrollRoot = getLayoutScrollRoot()
      if (scrollRoot && scrollSnapshot && added > 0) {
        schedulePrependScrollRestore(scrollRoot, scrollSnapshot)
      }

      return added
    },
    [],
  )

  const applyOlderPage = useCallback((page: AnchoredFeedPage<TItem>) => {
    if (page.items.length === 0) {
      const nextPagination = { ...page.pagination, hasOlder: false, olderCursor: null }
      setAnchoredPagination(nextPagination)
      anchoredPaginationRef.current = nextPagination
      return 0
    }

    let added = 0
    setItems((prev) => {
      const merged = mergeFeedItemsWithCount(prev, page.items, 'append')
      added = merged.added
      return merged.items
    })
    setAnchoredPagination(page.pagination)
    anchoredPaginationRef.current = page.pagination

    if (!page.pagination.hasOlder) {
      lastOlderCursorFetchedRef.current = page.pagination.olderCursor
    } else if (added === 0) {
      lastOlderCursorFetchedRef.current = page.pagination.olderCursor ?? null
    } else {
      lastOlderCursorFetchedRef.current = null
    }

    return added
  }, [])

  const prefetchNewerPages = useCallback(
    async (startPagination: AnchoredFeedPagination, scrollSnapshot: PrependScrollSnapshot | null) => {
      let pagination = startPagination
      let pagesLoaded = 0
      let lastBatchSize = pageLimit

      while (
        pagesLoaded < ANCHORED_FEED_MAX_PREFETCH_PAGES &&
        shouldPrefetchNextPage(lastBatchSize, pageLimit, pagination.hasNewer) &&
        pagination.newerCursor
      ) {
        const cursor = pagination.newerCursor
        if (lastNewerCursorFetchedRef.current === cursor) break
        lastNewerCursorFetchedRef.current = cursor

        const page = await fetchNewerRef.current(cursor)
        lastBatchSize = applyNewerPage(page, pagesLoaded === 0 ? scrollSnapshot : null)
        pagination = anchoredPaginationRef.current
        pagesLoaded += 1

        if (lastBatchSize === 0) break
      }
    },
    [applyNewerPage, pageLimit],
  )

  const prefetchOlderPages = useCallback(
    async (startPagination: AnchoredFeedPagination) => {
      let pagination = startPagination
      let pagesLoaded = 0
      let lastBatchSize = pageLimit

      while (
        pagesLoaded < ANCHORED_FEED_MAX_PREFETCH_PAGES &&
        shouldPrefetchNextPage(lastBatchSize, pageLimit, pagination.hasOlder) &&
        pagination.olderCursor
      ) {
        const cursor = pagination.olderCursor
        if (lastOlderCursorFetchedRef.current === cursor) break
        lastOlderCursorFetchedRef.current = cursor

        const page = await fetchOlderRef.current(cursor)
        lastBatchSize = applyOlderPage(page)
        pagination = anchoredPaginationRef.current
        pagesLoaded += 1

        if (lastBatchSize === 0) break
      }
    },
    [applyOlderPage, pageLimit],
  )

  /** around 직후 — newer/older 첫 페이지를 병렬로 받아 적용 */
  const warmBothSidesOnce = useCallback(
    async (pagination: AnchoredFeedPagination) => {
      const newerCursor = pagination.hasNewer ? pagination.newerCursor : null
      const olderCursor = pagination.hasOlder ? pagination.olderCursor : null
      if (!newerCursor && !olderCursor) return

      const [newerPage, olderPage] = await Promise.all([
        newerCursor && lastNewerCursorFetchedRef.current !== newerCursor
          ? fetchNewerRef.current(newerCursor).then((page) => {
              lastNewerCursorFetchedRef.current = newerCursor
              return page
            })
          : Promise.resolve(null),
        olderCursor && lastOlderCursorFetchedRef.current !== olderCursor
          ? fetchOlderRef.current(olderCursor).then((page) => {
              lastOlderCursorFetchedRef.current = olderCursor
              return page
            })
          : Promise.resolve(null),
      ])

      if (newerPage) applyNewerPage(newerPage, null)
      if (olderPage) applyOlderPage(olderPage)
    },
    [applyNewerPage, applyOlderPage],
  )

  /** 뷰포트 2배 채울 때까지 양방향 워밍 (빠른 스크롤 대비) */
  const warmAnchoredViewport = useCallback(async () => {
    for (let round = 0; round < ANCHORED_WARM_MAX_ROUNDS; round += 1) {
      if (!shouldWarmAnchoredViewport()) break

      let pagination = anchoredPaginationRef.current
      let progressed = false

      if (pagination.hasNewer && pagination.newerCursor) {
        await prefetchNewerPages(pagination, null)
        progressed = true
        pagination = anchoredPaginationRef.current
      }
      if (pagination.hasOlder && pagination.olderCursor) {
        await prefetchOlderPages(pagination)
        progressed = true
      }

      if (!progressed) break
    }
  }, [prefetchNewerPages, prefetchOlderPages])

  const warmAfterAround = useCallback(
    async (page: AnchoredFeedPage<TItem>) => {
      const aroundBatchSize = page.items.length
      await warmBothSidesOnce(page.pagination)

      if (shouldPrefetchNextPage(aroundBatchSize, pageLimit, anchoredPaginationRef.current.hasNewer)) {
        await prefetchNewerPages(anchoredPaginationRef.current, null)
      }
      if (
        shouldPrefetchNextPage(aroundBatchSize, pageLimit, anchoredPaginationRef.current.hasOlder)
      ) {
        await prefetchOlderPages(anchoredPaginationRef.current)
      }

      await warmAnchoredViewport()
    },
    [warmBothSidesOnce, warmAnchoredViewport, pageLimit, prefetchNewerPages, prefetchOlderPages],
  )

  useEffect(() => {
    if (!anchorId || !anchoredEnabled) {
      setAnchoredWarmComplete(true)
      return
    }

    const requestId = ++aroundRequestRef.current
    lastNewerCursorFetchedRef.current = null
    lastOlderCursorFetchedRef.current = null
    setAnchoredWarmComplete(false)
    setLoadingAround(true)
    setAroundError(null)
    setFeedMode('anchored')
    feedModeRef.current = 'anchored'

    void (async () => {
      try {
        const page = await fetchAroundRef.current(anchorId)
        if (aroundRequestRef.current !== requestId) return

        setItems(page.items)
        setAnchoredPagination(page.pagination)
        anchoredPaginationRef.current = page.pagination

        await warmAfterAround(page)
      } catch (e) {
        if (aroundRequestRef.current !== requestId) return
        setAroundError(e instanceof Error ? e.message : '피드를 불러지지 못했습니다.')
        resetToLatest(initialSnapshotRef.current.items, initialSnapshotRef.current.pagination)
      } finally {
        if (aroundRequestRef.current === requestId) {
          setLoadingAround(false)
          setAnchoredWarmComplete(true)
        }
      }
    })()
  }, [anchorId, anchoredEnabled, warmAfterAround, resetToLatest])

  useEffect(() => {
    if (anchorId || !anchoredEnabled) return
    if (feedMode !== 'anchored') return
    resetToLatest(initialSnapshotRef.current.items, initialSnapshotRef.current.pagination)
  }, [anchorId, anchoredEnabled, feedMode, resetToLatest])

  const replaceLatestItems = useCallback(
    (nextItems: TItem[], pagination: LatestPagination) => {
      resetToLatest(nextItems, pagination)
    },
    [resetToLatest],
  )

  const appendLatestItems = useCallback((incoming: TItem[], pagination: LatestPagination) => {
    setItems((prev) => mergeFeedItemsById(prev, incoming, 'append'))
    setLatestPagination(pagination)
  }, [])

  const loadNewer = useCallback(async () => {
    const pagination = anchoredPaginationRef.current
    if (feedModeRef.current !== 'anchored' || !pagination.hasNewer || !pagination.newerCursor) return
    const cursor = pagination.newerCursor
    if (loadNewerInFlightRef.current || lastNewerCursorFetchedRef.current === cursor) return

    loadNewerInFlightRef.current = true
    setLoadingNewer(true)
    const scrollRoot = getLayoutScrollRoot()
    const scrollSnapshot = scrollRoot ? capturePrependScrollSnapshot(scrollRoot) : null

    try {
      lastNewerCursorFetchedRef.current = cursor
      const page = await fetchNewerRef.current(cursor)
      const batchSize = applyNewerPage(page, scrollSnapshot)
      if (
        batchSize > 0 &&
        shouldPrefetchNextPage(batchSize, pageLimit, anchoredPaginationRef.current.hasNewer)
      ) {
        await prefetchNewerPages(anchoredPaginationRef.current, null)
      }
    } finally {
      loadNewerInFlightRef.current = false
      setLoadingNewer(false)
    }
  }, [applyNewerPage, pageLimit, prefetchNewerPages])

  const loadOlder = useCallback(async () => {
    const pagination = anchoredPaginationRef.current
    if (feedModeRef.current !== 'anchored' || !pagination.hasOlder || !pagination.olderCursor) return
    const cursor = pagination.olderCursor
    if (loadOlderInFlightRef.current || lastOlderCursorFetchedRef.current === cursor) return

    loadOlderInFlightRef.current = true
    lastOlderCursorFetchedRef.current = cursor
    setLoadingOlder(true)
    try {
      const page = await fetchOlderRef.current(cursor)
      const batchSize = applyOlderPage(page)
      if (
        batchSize > 0 &&
        shouldPrefetchNextPage(batchSize, pageLimit, anchoredPaginationRef.current.hasOlder)
      ) {
        await prefetchOlderPages(anchoredPaginationRef.current)
      }
    } finally {
      loadOlderInFlightRef.current = false
      setLoadingOlder(false)
    }
  }, [applyOlderPage, pageLimit, prefetchOlderPages])

  const hasMoreDown =
    feedMode === 'anchored' ? anchoredPagination.hasOlder : latestPagination.hasNext
  const hasMoreUp = feedMode === 'anchored' && anchoredPagination.hasNewer

  return {
    items,
    feedMode,
    latestPagination,
    anchoredPagination,
    loadingAround,
    loadingNewer,
    loadingOlder,
    aroundError,
    anchoredWarmComplete,
    hasMoreDown,
    hasMoreUp,
    loadNewer,
    loadOlder,
    resetToLatest,
    replaceLatestItems,
    appendLatestItems,
  }
}
