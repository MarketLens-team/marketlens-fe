import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ANCHORED_FEED_PAGE_LIMIT,
  EMPTY_ANCHORED_PAGINATION,
  type AnchoredFeedPagination,
  type FeedMode,
} from '../data/types/anchoredFeed'
import { anchoredCursorsEqual, mergeAnchoredPaginationForDirection } from '../lib/anchoredFeedCursor'
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

export function useAnchoredFeed<TItem extends { id: string; publishedAt: string }>({
  scopeKey,
  anchorId,
  initialItems,
  initialLatestPagination,
  anchoredEnabled = true,
  pageLimit: _pageLimit = ANCHORED_FEED_PAGE_LIMIT, // API limit — 호출부와 시그니처 유지
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
  /** 방금 소비한 커서 — 같은 커서로 중복 요청만 막음 (성공 후 null로 풀지 않음) */
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
      const prevPagination = anchoredPaginationRef.current

      if (page.items.length === 0) {
        const nextPagination = mergeAnchoredPaginationForDirection(prevPagination, page.pagination, 'newer')
        const clearedNewer = { ...nextPagination, hasNewer: false, newerCursor: null }
        setAnchoredPagination(clearedNewer)
        anchoredPaginationRef.current = clearedNewer
        markCursorConsumed('newer', requestedCursor, clearedNewer, 0)
        return 0
      }

      let added = 0
      setItems((prev) => {
        const merged = mergeFeedItemsWithCount(prev, page.items, 'prepend')
        added = merged.added
        return merged.items
      })

      let pagination = mergeAnchoredPaginationForDirection(prevPagination, page.pagination, 'newer')

      const stuckAtSameCursor =
        added === 0 &&
        requestedCursor != null &&
        anchoredCursorsEqual(pagination.newerCursor, requestedCursor)

      if (stuckAtSameCursor) {
        pagination = { ...pagination, hasNewer: false, newerCursor: null }
      }

      setAnchoredPagination(pagination)
      anchoredPaginationRef.current = pagination
      markCursorConsumed('newer', requestedCursor, pagination, added)

      const scrollRoot = getLayoutScrollRoot()
      if (scrollRoot && scrollSnapshot && added > 0) {
        schedulePrependScrollRestore(scrollRoot, scrollSnapshot)
      }

      return added
    },
    [markCursorConsumed],
  )

  const applyOlderPage = useCallback(
    (page: AnchoredFeedPage<TItem>, requestedCursor: string | null = null) => {
      const prevPagination = anchoredPaginationRef.current

      if (page.items.length === 0) {
        const nextPagination = mergeAnchoredPaginationForDirection(prevPagination, page.pagination, 'older')
        const clearedOlder = { ...nextPagination, hasOlder: false, olderCursor: null }
        setAnchoredPagination(clearedOlder)
        anchoredPaginationRef.current = clearedOlder
        markCursorConsumed('older', requestedCursor, clearedOlder, 0)
        return 0
      }

      let added = 0
      setItems((prev) => {
        const merged = mergeFeedItemsWithCount(prev, page.items, 'append')
        added = merged.added
        return merged.items
      })

      let pagination = mergeAnchoredPaginationForDirection(prevPagination, page.pagination, 'older')

      const stuckAtSameCursor =
        added === 0 &&
        requestedCursor != null &&
        anchoredCursorsEqual(pagination.olderCursor, requestedCursor)

      if (stuckAtSameCursor) {
        pagination = { ...pagination, hasOlder: false, olderCursor: null }
      }

      setAnchoredPagination(pagination)
      anchoredPaginationRef.current = pagination
      markCursorConsumed('older', requestedCursor, pagination, added)

      return added
    },
    [markCursorConsumed],
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
        const aroundPagination = page.pagination
        setAnchoredPagination(aroundPagination)
        anchoredPaginationRef.current = aroundPagination
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
  }, [anchorId, anchoredEnabled, resetToLatest])

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

  /** around만 로드 — 예전 warm/prefetch 제거, 스크롤 시에만 newer/older */
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
