import { useCallback, useEffect, useRef, useState } from 'react'
import {
  EMPTY_ANCHORED_PAGINATION,
  type AnchoredFeedPagination,
  type FeedMode,
} from '../data/types/anchoredFeed'
import { mergeFeedItemsById } from '../lib/mergeFeedItems'

interface LatestPagination {
  nextCursor: string | null
  hasNext: boolean
}

interface UseAnchoredFeedOptions<TItem> {
  /** 종목 코드·인물 ID 등 — 변경 시 latest 초기화 */
  scopeKey: string
  anchorId: string | null
  initialItems: TItem[]
  initialLatestPagination: LatestPagination
  /** anchored 모드 비활성(예: mock·필터) */
  anchoredEnabled?: boolean
  fetchAround: (anchorId: string) => Promise<{
    items: TItem[]
    pagination: AnchoredFeedPagination
  }>
  fetchNewer: (cursor: string) => Promise<{
    items: TItem[]
    pagination: AnchoredFeedPagination
  }>
  fetchOlder: (cursor: string) => Promise<{
    items: TItem[]
    pagination: AnchoredFeedPagination
  }>
}

export function useAnchoredFeed<TItem extends { id: string }>({
  scopeKey,
  anchorId,
  initialItems,
  initialLatestPagination,
  anchoredEnabled = true,
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
  const loadNewerInFlightRef = useRef(false)
  const loadOlderInFlightRef = useRef(false)
  const lastNewerCursorFetchedRef = useRef<string | null>(null)
  const lastOlderCursorFetchedRef = useRef<string | null>(null)
  const initialSnapshotRef = useRef({ items: initialItems, pagination: initialLatestPagination })
  const latestSyncKeyRef = useRef<string | null>(null)

  initialSnapshotRef.current = { items: initialItems, pagination: initialLatestPagination }

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

  /** latest 모드 — 서버 초기 데이터가 바뀔 때만 동기화 (참조 변경 무시) */
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

  /** anchorId 변경 시에만 around 1회 */
  useEffect(() => {
    if (!anchorId || !anchoredEnabled) return

    const requestId = ++aroundRequestRef.current
    lastNewerCursorFetchedRef.current = null
    lastOlderCursorFetchedRef.current = null
    setLoadingAround(true)
    setAroundError(null)
    setFeedMode('anchored')

    void fetchAroundRef
      .current(anchorId)
      .then((page) => {
        if (aroundRequestRef.current !== requestId) return
        setItems(page.items)
        setAnchoredPagination(page.pagination)
      })
      .catch((e) => {
        if (aroundRequestRef.current !== requestId) return
        setAroundError(e instanceof Error ? e.message : '피드를 불러오지 못했습니다.')
        resetToLatest(initialSnapshotRef.current.items, initialSnapshotRef.current.pagination)
      })
      .finally(() => {
        if (aroundRequestRef.current === requestId) setLoadingAround(false)
      })
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
    if (feedMode !== 'anchored' || !anchoredPagination.hasNewer || !anchoredPagination.newerCursor) {
      return
    }
    const cursor = anchoredPagination.newerCursor
    if (loadNewerInFlightRef.current || lastNewerCursorFetchedRef.current === cursor) return

    loadNewerInFlightRef.current = true
    lastNewerCursorFetchedRef.current = cursor
    setLoadingNewer(true)
    try {
      const page = await fetchNewerRef.current(cursor)
      if (page.items.length === 0) {
        setAnchoredPagination((prev) => ({ ...prev, hasNewer: false, newerCursor: null }))
        return
      }
      setItems((prev) => mergeFeedItemsById(prev, page.items, 'prepend'))
      setAnchoredPagination(page.pagination)
      if (!page.pagination.hasNewer) {
        lastNewerCursorFetchedRef.current = page.pagination.newerCursor
      } else {
        lastNewerCursorFetchedRef.current = null
      }
    } finally {
      loadNewerInFlightRef.current = false
      setLoadingNewer(false)
    }
  }, [feedMode, anchoredPagination.hasNewer, anchoredPagination.newerCursor])

  const loadOlder = useCallback(async () => {
    if (feedMode !== 'anchored') return
    if (!anchoredPagination.hasOlder || !anchoredPagination.olderCursor) return

    const cursor = anchoredPagination.olderCursor
    if (loadOlderInFlightRef.current || lastOlderCursorFetchedRef.current === cursor) return

    loadOlderInFlightRef.current = true
    lastOlderCursorFetchedRef.current = cursor
    setLoadingOlder(true)
    try {
      const page = await fetchOlderRef.current(cursor)
      if (page.items.length === 0) {
        setAnchoredPagination((prev) => ({ ...prev, hasOlder: false, olderCursor: null }))
        return
      }
      setItems((prev) => mergeFeedItemsById(prev, page.items, 'append'))
      setAnchoredPagination(page.pagination)
      if (!page.pagination.hasOlder) {
        lastOlderCursorFetchedRef.current = page.pagination.olderCursor
      } else {
        lastOlderCursorFetchedRef.current = null
      }
    } finally {
      loadOlderInFlightRef.current = false
      setLoadingOlder(false)
    }
  }, [feedMode, anchoredPagination.hasOlder, anchoredPagination.olderCursor])

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
    hasMoreDown,
    hasMoreUp,
    loadNewer,
    loadOlder,
    resetToLatest,
    replaceLatestItems,
    appendLatestItems,
  }
}
