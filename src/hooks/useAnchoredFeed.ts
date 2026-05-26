import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ANCHORED_FEED_PAGE_LIMIT,
  EMPTY_ANCHORED_PAGINATION,
  type AnchoredFeedPagination,
  type FeedMode,
} from '../data/types/anchoredFeed'
import { anchoredCursorsEqual } from '../lib/anchoredFeedCursor'
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

interface AnchoredEdge {
  hasMore: boolean
  cursor: string | null
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

function toAnchoredPagination(newer: AnchoredEdge, older: AnchoredEdge): AnchoredFeedPagination {
  return {
    hasNewer: newer.hasMore,
    newerCursor: newer.hasMore ? newer.cursor : null,
    hasOlder: older.hasMore,
    olderCursor: older.hasMore ? older.cursor : null,
  }
}

export function useAnchoredFeed<TItem extends { id: string; publishedAt: string }>({
  scopeKey,
  anchorId,
  initialItems,
  initialLatestPagination,
  anchoredEnabled = true,
  pageLimit: _pageLimit = ANCHORED_FEED_PAGE_LIMIT,
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

  const aroundRequestRef = useRef(0)
  const feedModeRef = useRef<FeedMode>('latest')
  const loadNewerInFlightRef = useRef(false)
  const loadOlderInFlightRef = useRef(false)
  const lastNewerCursorFetchedRef = useRef<string | null>(null)
  const lastOlderCursorFetchedRef = useRef<string | null>(null)
  const newerEdgeRef = useRef<AnchoredEdge>({ hasMore: false, cursor: null })
  const olderEdgeRef = useRef<AnchoredEdge>({ hasMore: false, cursor: null })
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

  const syncAnchoredPaginationFromEdges = useCallback(() => {
    const pagination = toAnchoredPagination(newerEdgeRef.current, olderEdgeRef.current)
    setAnchoredPagination(pagination)
    anchoredPaginationRef.current = pagination
    return pagination
  }, [])

  const resetAnchoredEdges = useCallback(() => {
    newerEdgeRef.current = { hasMore: false, cursor: null }
    olderEdgeRef.current = { hasMore: false, cursor: null }
    syncAnchoredPaginationFromEdges()
  }, [syncAnchoredPaginationFromEdges])

  const resetToLatest = useCallback(
    (nextItems: TItem[], pagination: LatestPagination) => {
      setFeedMode('latest')
      setItems(nextItems)
      setLatestPagination(pagination)
      setAnchoredPagination(EMPTY_ANCHORED_PAGINATION)
      setAroundError(null)
      lastNewerCursorFetchedRef.current = null
      lastOlderCursorFetchedRef.current = null
      resetAnchoredEdges()
    },
    [resetAnchoredEdges],
  )

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

  const markCursorConsumed = useCallback(
    (
      direction: 'newer' | 'older',
      requestedCursor: string | null,
      pagination: AnchoredFeedPagination,
      added: number,
    ) => {
      const ref = direction === 'newer' ? lastNewerCursorFetchedRef : lastOlderCursorFetchedRef
      const hasMore = direction === 'newer' ? pagination.hasNewer : pagination.hasOlder
      const nextCursor = direction === 'newer' ? pagination.newerCursor : pagination.olderCursor

      if (!hasMore) {
        ref.current = nextCursor
        return
      }

      if (
        added > 0 &&
        requestedCursor != null &&
        nextCursor != null &&
        !anchoredCursorsEqual(requestedCursor, nextCursor)
      ) {
        ref.current = null
        return
      }

      ref.current = requestedCursor
    },
    [],
  )

  const applyNewerPage = useCallback(
    (
      page: AnchoredFeedPage<TItem>,
      scrollSnapshot: PrependScrollSnapshot | null,
      requestedCursor: string | null = null,
    ) => {
      if (page.items.length === 0) {
        newerEdgeRef.current = { hasMore: false, cursor: null }
        const pagination = syncAnchoredPaginationFromEdges()
        markCursorConsumed('newer', requestedCursor, pagination, 0)
        return 0
      }

      let added = 0
      setItems((prev) => {
        const merged = mergeFeedItemsWithCount(prev, page.items, 'prepend')
        added = merged.added
        return merged.items
      })

      let newerEdge: AnchoredEdge = {
        hasMore: page.pagination.hasNewer,
        cursor: page.pagination.hasNewer ? page.pagination.newerCursor : null,
      }

      const stuckAtSameCursor =
        added === 0 &&
        requestedCursor != null &&
        newerEdge.cursor != null &&
        anchoredCursorsEqual(newerEdge.cursor, requestedCursor)

      if (stuckAtSameCursor) {
        newerEdge = { hasMore: false, cursor: null }
      }

      newerEdgeRef.current = newerEdge
      const pagination = syncAnchoredPaginationFromEdges()
      markCursorConsumed('newer', requestedCursor, pagination, added)

      const scrollRoot = getLayoutScrollRoot()
      if (scrollRoot && scrollSnapshot && added > 0) {
        schedulePrependScrollRestore(scrollRoot, scrollSnapshot)
      }

      return added
    },
    [markCursorConsumed, syncAnchoredPaginationFromEdges],
  )

  const applyOlderPage = useCallback(
    (page: AnchoredFeedPage<TItem>, requestedCursor: string | null = null) => {
      if (page.items.length === 0) {
        olderEdgeRef.current = { hasMore: false, cursor: null }
        const pagination = syncAnchoredPaginationFromEdges()
        markCursorConsumed('older', requestedCursor, pagination, 0)
        return 0
      }

      let added = 0
      setItems((prev) => {
        const merged = mergeFeedItemsWithCount(prev, page.items, 'append')
        added = merged.added
        return merged.items
      })

      let olderEdge: AnchoredEdge = {
        hasMore: page.pagination.hasOlder,
        cursor: page.pagination.hasOlder ? page.pagination.olderCursor : null,
      }

      const stuckAtSameCursor =
        added === 0 &&
        requestedCursor != null &&
        olderEdge.cursor != null &&
        anchoredCursorsEqual(olderEdge.cursor, requestedCursor)

      if (stuckAtSameCursor) {
        olderEdge = { hasMore: false, cursor: null }
      }

      olderEdgeRef.current = olderEdge
      const pagination = syncAnchoredPaginationFromEdges()
      markCursorConsumed('older', requestedCursor, pagination, added)

      return added
    },
    [markCursorConsumed, syncAnchoredPaginationFromEdges],
  )

  useEffect(() => {
    if (!anchorId || !anchoredEnabled) return

    const requestId = ++aroundRequestRef.current
    lastNewerCursorFetchedRef.current = null
    lastOlderCursorFetchedRef.current = null
    setLoadingAround(true)
    setAroundError(null)
    setFeedMode('anchored')
    feedModeRef.current = 'anchored'

    void (async () => {
      try {
        const page = await fetchAroundRef.current(anchorId)
        if (aroundRequestRef.current !== requestId) return

        setItems(page.items)
        newerEdgeRef.current = {
          hasMore: page.pagination.hasNewer,
          cursor: page.pagination.newerCursor,
        }
        olderEdgeRef.current = {
          hasMore: page.pagination.hasOlder,
          cursor: page.pagination.olderCursor,
        }
        syncAnchoredPaginationFromEdges()
      } catch (e) {
        if (aroundRequestRef.current !== requestId) return
        setAroundError(e instanceof Error ? e.message : '피드를 불러오지 못했습니다.')
        resetToLatest(initialSnapshotRef.current.items, initialSnapshotRef.current.pagination)
      } finally {
        if (aroundRequestRef.current === requestId) {
          setLoadingAround(false)
        }
      }
    })()
  }, [anchorId, anchoredEnabled, resetToLatest, syncAnchoredPaginationFromEdges])

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
    if (loadNewerInFlightRef.current || anchoredCursorsEqual(lastNewerCursorFetchedRef.current, cursor)) return

    loadNewerInFlightRef.current = true
    setLoadingNewer(true)
    const scrollRoot = getLayoutScrollRoot()
    const scrollSnapshot = scrollRoot ? capturePrependScrollSnapshot(scrollRoot) : null

    try {
      const page = await fetchNewerRef.current(cursor)
      applyNewerPage(page, scrollSnapshot, cursor)
    } finally {
      loadNewerInFlightRef.current = false
      setLoadingNewer(false)
    }
  }, [applyNewerPage])

  const loadOlder = useCallback(async () => {
    const pagination = anchoredPaginationRef.current
    if (feedModeRef.current !== 'anchored' || !pagination.hasOlder || !pagination.olderCursor) return
    const cursor = pagination.olderCursor
    if (loadOlderInFlightRef.current || anchoredCursorsEqual(lastOlderCursorFetchedRef.current, cursor)) return

    loadOlderInFlightRef.current = true
    setLoadingOlder(true)
    try {
      const page = await fetchOlderRef.current(cursor)
      applyOlderPage(page, cursor)
    } finally {
      loadOlderInFlightRef.current = false
      setLoadingOlder(false)
    }
  }, [applyOlderPage])

  const hasMoreDown =
    feedMode === 'anchored' ? anchoredPagination.hasOlder : latestPagination.hasNext
  const hasMoreUp = feedMode === 'anchored' && anchoredPagination.hasNewer

  const anchoredReady = !anchoredEnabled || !anchorId || (!loadingAround && feedMode === 'anchored')

  return {
    items,
    feedMode,
    latestPagination,
    anchoredPagination,
    loadingAround,
    loadingNewer,
    loadingOlder,
    aroundError,
    anchoredWarmComplete: anchoredReady,
    hasMoreDown,
    hasMoreUp,
    loadNewer,
    loadOlder,
    resetToLatest,
    replaceLatestItems,
    appendLatestItems,
  }
}
