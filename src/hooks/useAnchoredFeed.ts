import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  ANCHORED_FEED_PAGE_LIMIT,
  ANCHORED_LOAD_MIN_INTERVAL_MS,
  ANCHORED_LOAD_MIN_VISIBLE_MS,
  EMPTY_ANCHORED_PAGINATION,
  type AnchoredFeedPagination,
  type FeedMode,
} from '../data/types/anchoredFeed'
import { waitAnchoredLoadGap, waitAnchoredLoadVisible } from '../lib/anchoredLoadTiming'
import {
  alignNewerEdgeToListTop,
  anchoredCursorItemId,
  anchoredCursorsEqual,
  resolveNewerEdgeFromPage,
  resolveOlderEdgeFromPage,
} from '../lib/anchoredFeedCursor'
import {
  mergeAnchoredFeedItemsWithCount,
  mergeFeedItemsById,
  sortFeedItemsByPublishedAtDesc,
} from '../lib/mergeFeedItems'
import {
  capturePrependScrollSnapshot,
  schedulePrependScrollRestore,
  type PrependScrollSnapshot,
} from '../lib/preserveScrollOnPrepend'
import { resolveScrollRoot } from './useInfiniteScroll'

type AnchoredLoadDirection = 'newer' | 'older'

interface LatestPagination {
  nextCursor: string | null
  hasNext: boolean
}

interface AnchoredFeedPage<TItem> {
  items: TItem[]
  pagination: AnchoredFeedPagination
}

/** anchored 양방향 커서 — newer/older 응답이 반대쪽 edge를 덮지 않도록 분리 */
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
  /** prepend 스크롤 복원·newer 캡처용 (기본: Layout main) */
  scrollRootSelector?: string
}

function toAnchoredPagination(newer: AnchoredEdge, older: AnchoredEdge): AnchoredFeedPagination {
  return {
    hasNewer: newer.hasMore,
    newerCursor: newer.hasMore ? newer.cursor : null,
    hasOlder: older.hasMore,
    olderCursor: older.hasMore ? older.cursor : null,
  }
}

/**
 * latest: `/cursor`만, 아래로 loadMore.
 * anchored: `around` 초기화 → 위 `newer`(prepend, newerCursor만 갱신) / 아래 `older`(append, olderCursor만 갱신).
 */
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
  scrollRootSelector,
}: UseAnchoredFeedOptions<TItem>) {
  const [items, setItems] = useState(initialItems)
  const [feedMode, setFeedMode] = useState<FeedMode>('latest')
  const [latestPagination, setLatestPagination] = useState(initialLatestPagination)
  const [anchoredPagination, setAnchoredPagination] =
    useState<AnchoredFeedPagination>(EMPTY_ANCHORED_PAGINATION)
  const [loadingAround, setLoadingAround] = useState(false)
  const [loadingNewer, setLoadingNewer] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [anchoredLoadingUi, setAnchoredLoadingUi] = useState<AnchoredLoadDirection | null>(null)
  const [aroundError, setAroundError] = useState<string | null>(null)

  const aroundRequestRef = useRef(0)
  const feedModeRef = useRef<FeedMode>('latest')
  /** newer/older 동시 요청·역순 응답 방지 */
  const anchoredLoadInFlightRef = useRef(false)
  const anchoredLoadSeqRef = useRef(0)
  const lastAnchoredLoadFinishedAtRef = useRef(0)
  const pendingAnchoredLoadRef = useRef<AnchoredLoadDirection | null>(null)
  const lastNewerCursorFetchedRef = useRef<string | null>(null)
  const lastOlderCursorFetchedRef = useRef<string | null>(null)
  /** added=0 중복 older/newer 페이지가 같은 커서로 연속될 때만 종료 */
  const olderOverlapCursorRef = useRef<string | null>(null)
  const olderOverlapCountRef = useRef(0)
  const newerOverlapCursorRef = useRef<string | null>(null)
  const newerOverlapCountRef = useRef(0)
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
      anchoredLoadInFlightRef.current = false
      anchoredLoadSeqRef.current += 1
      pendingAnchoredLoadRef.current = null
      lastAnchoredLoadFinishedAtRef.current = 0
      olderOverlapCursorRef.current = null
      olderOverlapCountRef.current = 0
      newerOverlapCursorRef.current = null
      newerOverlapCountRef.current = 0
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

      // 항목이 추가됐으면 같은 id 커서라도 다음 페이지 허용 (BE가 경계 id를 유지하는 경우)
      if (added > 0) {
        ref.current = null
        return
      }

      if (
        requestedCursor != null &&
        nextCursor != null &&
        !anchoredCursorsEqual(requestedCursor, nextCursor)
      ) {
        ref.current = null
        return
      }

      // BE가 hasMore=true 인데 경계 항목만 다시 줄 때 — 한 번 더 시도할 수 있게 잠금 해제
      if (added === 0 && hasMore) {
        ref.current = null
        return
      }

      ref.current = requestedCursor
    },
    [],
  )

  const shouldEndAnchoredDirection = useCallback(
    (
      direction: 'newer' | 'older',
      added: number,
      requestedCursor: string | null,
      nextCursor: string | null,
      apiHasMore: boolean,
    ) => {
      if (added > 0 || !apiHasMore || requestedCursor == null || nextCursor == null) {
        if (direction === 'older') {
          olderOverlapCursorRef.current = null
          olderOverlapCountRef.current = 0
        } else {
          newerOverlapCursorRef.current = null
          newerOverlapCountRef.current = 0
        }
        return false
      }

      if (!anchoredCursorsEqual(requestedCursor, nextCursor)) {
        if (direction === 'older') {
          olderOverlapCursorRef.current = null
          olderOverlapCountRef.current = 0
        } else {
          newerOverlapCursorRef.current = null
          newerOverlapCountRef.current = 0
        }
        return false
      }

      const overlapKey = anchoredCursorItemId(requestedCursor) ?? requestedCursor
      if (direction === 'older') {
        if (olderOverlapCursorRef.current === overlapKey) {
          olderOverlapCountRef.current += 1
        } else {
          olderOverlapCursorRef.current = overlapKey
          olderOverlapCountRef.current = 1
        }
        return olderOverlapCountRef.current >= 2
      }

      if (newerOverlapCursorRef.current === overlapKey) {
        newerOverlapCountRef.current += 1
      } else {
        newerOverlapCursorRef.current = overlapKey
        newerOverlapCountRef.current = 1
      }
      return newerOverlapCountRef.current >= 2
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
      let nextItems: TItem[] = []
      setItems((prev) => {
        const merged = mergeAnchoredFeedItemsWithCount(prev, page.items, 'prepend')
        added = merged.added
        nextItems = merged.items
        return merged.items
      })

      // newer 응답: newer edge만 갱신, olderEdgeRef는 유지
      let newerEdge: AnchoredEdge = resolveNewerEdgeFromPage(page.items, page.pagination)
      newerEdge = alignNewerEdgeToListTop(nextItems, newerEdge)

      if (
        shouldEndAnchoredDirection(
          'newer',
          added,
          requestedCursor,
          newerEdge.cursor,
          page.pagination.hasNewer,
        )
      ) {
        newerEdge = { hasMore: false, cursor: null }
      }

      newerEdgeRef.current = newerEdge
      const pagination = syncAnchoredPaginationFromEdges()
      markCursorConsumed('newer', requestedCursor, pagination, added)

      if (added > 0) {
        lastOlderCursorFetchedRef.current = null
      }

      const scrollRoot = resolveScrollRoot(scrollRootSelector)
      if (scrollRoot && scrollSnapshot && added > 0) {
        schedulePrependScrollRestore(scrollRoot, scrollSnapshot)
      }

      return added
    },
    [markCursorConsumed, scrollRootSelector, shouldEndAnchoredDirection, syncAnchoredPaginationFromEdges],
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
      let nextItems: TItem[] = []
      setItems((prev) => {
        const merged = mergeAnchoredFeedItemsWithCount(prev, page.items, 'append')
        added = merged.added
        nextItems = merged.items
        return merged.items
      })

      // older 응답: older edge만 갱신, newerEdgeRef는 목록 최상단과 맞춤
      let olderEdge: AnchoredEdge = resolveOlderEdgeFromPage(page.items, page.pagination)

      newerEdgeRef.current = alignNewerEdgeToListTop(nextItems, newerEdgeRef.current)

      if (
        shouldEndAnchoredDirection(
          'older',
          added,
          requestedCursor,
          olderEdge.cursor,
          page.pagination.hasOlder,
        )
      ) {
        olderEdge = { hasMore: false, cursor: null }
      }

      olderEdgeRef.current = olderEdge
      const pagination = syncAnchoredPaginationFromEdges()
      markCursorConsumed('older', requestedCursor, pagination, added)

      if (added > 0) {
        lastNewerCursorFetchedRef.current = null
      }

      return added
    },
    [markCursorConsumed, shouldEndAnchoredDirection, syncAnchoredPaginationFromEdges],
  )

  useEffect(() => {
    if (!anchorId || !anchoredEnabled) return

    const requestId = ++aroundRequestRef.current
    lastNewerCursorFetchedRef.current = null
    lastOlderCursorFetchedRef.current = null
    anchoredLoadInFlightRef.current = false
    anchoredLoadSeqRef.current += 1
    pendingAnchoredLoadRef.current = null
    lastAnchoredLoadFinishedAtRef.current = 0
    olderOverlapCursorRef.current = null
    olderOverlapCountRef.current = 0
    newerOverlapCursorRef.current = null
    newerOverlapCountRef.current = 0
    setLoadingAround(true)
    setAroundError(null)
    setFeedMode('anchored')
    feedModeRef.current = 'anchored'

    void (async () => {
      try {
        const page = await fetchAroundRef.current(anchorId)
        if (aroundRequestRef.current !== requestId) return

        const sortedItems = sortFeedItemsByPublishedAtDesc(page.items)
        setItems(sortedItems)
        newerEdgeRef.current = alignNewerEdgeToListTop(
          sortedItems,
          resolveNewerEdgeFromPage(page.items, page.pagination),
        )
        olderEdgeRef.current = resolveOlderEdgeFromPage(page.items, page.pagination)
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

  const clearAnchoredLoading = useCallback(() => {
    flushSync(() => {
      setAnchoredLoadingUi(null)
      setLoadingNewer(false)
      setLoadingOlder(false)
    })
  }, [])

  const finishAnchoredLoad = useCallback(
    (seq: number) => {
      if (seq !== anchoredLoadSeqRef.current) return
      anchoredLoadInFlightRef.current = false
      clearAnchoredLoading()
      lastAnchoredLoadFinishedAtRef.current = Date.now()
    },
    [clearAnchoredLoading],
  )

  const showAnchoredLoading = useCallback((direction: AnchoredLoadDirection) => {
    flushSync(() => {
      setAnchoredLoadingUi(direction)
      setLoadingNewer(direction === 'newer')
      setLoadingOlder(direction === 'older')
    })
  }, [])

  const failAnchoredDirection = useCallback(
    (direction: AnchoredLoadDirection, requestedCursor: string) => {
      const consumedRef =
        direction === 'newer' ? lastNewerCursorFetchedRef : lastOlderCursorFetchedRef
      consumedRef.current = requestedCursor
      if (direction === 'newer') {
        newerEdgeRef.current = { hasMore: false, cursor: null }
      } else {
        olderEdgeRef.current = { hasMore: false, cursor: null }
      }
      syncAnchoredPaginationFromEdges()
      pendingAnchoredLoadRef.current = null
    },
    [syncAnchoredPaginationFromEdges],
  )

  const canRunAnchoredLoad = useCallback((direction: AnchoredLoadDirection): string | null => {
    const pagination = anchoredPaginationRef.current
    if (feedModeRef.current !== 'anchored') return null
    if (direction === 'newer') {
      if (!pagination.hasNewer || !pagination.newerCursor) return null
      const cursor = pagination.newerCursor
      if (anchoredCursorsEqual(lastNewerCursorFetchedRef.current, cursor)) return null
      return cursor
    }
    if (!pagination.hasOlder || !pagination.olderCursor) return null
    const cursor = pagination.olderCursor
    if (anchoredCursorsEqual(lastOlderCursorFetchedRef.current, cursor)) return null
    return cursor
  }, [])

  const runAnchoredLoadRef = useRef<(direction: AnchoredLoadDirection) => Promise<void>>(async () => {})

  const runAnchoredLoad = useCallback(
    async (direction: AnchoredLoadDirection) => {
      await waitAnchoredLoadGap(lastAnchoredLoadFinishedAtRef.current, ANCHORED_LOAD_MIN_INTERVAL_MS)

      const cursor = canRunAnchoredLoad(direction)
      if (cursor == null) {
        anchoredLoadInFlightRef.current = false
        clearAnchoredLoading()
        const pending = pendingAnchoredLoadRef.current
        pendingAnchoredLoadRef.current = null
        if (pending) {
          showAnchoredLoading(pending)
          anchoredLoadInFlightRef.current = true
          void runAnchoredLoadRef.current(pending)
        }
        return
      }

      const seq = ++anchoredLoadSeqRef.current
      pendingAnchoredLoadRef.current = null

      const startedAt = Date.now()
      const scrollRoot = resolveScrollRoot(scrollRootSelector)
      const scrollSnapshot =
        direction === 'newer' && scrollRoot ? capturePrependScrollSnapshot(scrollRoot) : null

      try {
        const page =
          direction === 'newer'
            ? await fetchNewerRef.current(cursor)
            : await fetchOlderRef.current(cursor)
        if (seq !== anchoredLoadSeqRef.current) return
        if (direction === 'newer') {
          applyNewerPage(page, scrollSnapshot, cursor)
        } else {
          applyOlderPage(page, cursor)
        }
      } catch (error) {
        if (seq === anchoredLoadSeqRef.current) {
          failAnchoredDirection(direction, cursor)
          throw error
        }
      } finally {
        await waitAnchoredLoadVisible(startedAt, ANCHORED_LOAD_MIN_VISIBLE_MS)
        finishAnchoredLoad(seq)

        const pending = pendingAnchoredLoadRef.current
        pendingAnchoredLoadRef.current = null
        if (pending) {
          showAnchoredLoading(pending)
          anchoredLoadInFlightRef.current = true
          void runAnchoredLoadRef.current(pending)
        }
      }
    },
    [
      applyNewerPage,
      applyOlderPage,
      canRunAnchoredLoad,
      clearAnchoredLoading,
      failAnchoredDirection,
      finishAnchoredLoad,
      scrollRootSelector,
      showAnchoredLoading,
    ],
  )

  runAnchoredLoadRef.current = runAnchoredLoad

  const scheduleAnchoredLoad = useCallback(
    (direction: AnchoredLoadDirection): Promise<void> => {
      showAnchoredLoading(direction)

      if (anchoredLoadInFlightRef.current) {
        pendingAnchoredLoadRef.current = direction
        return Promise.resolve()
      }

      anchoredLoadInFlightRef.current = true
      return runAnchoredLoad(direction)
    },
    [runAnchoredLoad, showAnchoredLoading],
  )

  const loadNewer = useCallback(() => scheduleAnchoredLoad('newer'), [scheduleAnchoredLoad])

  const loadOlder = useCallback(() => scheduleAnchoredLoad('older'), [scheduleAnchoredLoad])

  const hasMoreDown =
    feedMode === 'anchored' ? anchoredPagination.hasOlder : latestPagination.hasNext
  const hasMoreUp = feedMode === 'anchored' && anchoredPagination.hasNewer

  /** around 로딩이 끝나면 anchored·latest(폴백) 모두 스크롤 로드 가능 */
  const anchoredReady = !anchoredEnabled || !anchorId || !loadingAround

  return {
    items,
    feedMode,
    latestPagination,
    anchoredPagination,
    loadingAround,
    loadingNewer,
    loadingOlder,
    anchoredLoadingUi,
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
