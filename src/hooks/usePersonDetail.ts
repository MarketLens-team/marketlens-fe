import { useCallback, useMemo, useState } from 'react'
import {
  fetchPersonMentionsAround,
  fetchPersonMentionsCursorByPersonId,
  fetchPersonMentionsFeedPage,
  fetchPersonMentionsNewer,
  fetchPersonMentionsOlder,
} from '../data/clients/personClient'
import { mapPersonMentionsAround, mapPersonStatement } from '../data/mappers/personMapper'
import { ANCHORED_FEED_PAGE_LIMIT } from '../data/types/anchoredFeed'
import type { PersonMentionsFeedData, PersonMentionsRange } from '../data/types/person'
import { useAnchoredFeed } from './useAnchoredFeed'
import { useAsyncData } from './useAsyncData'

const PERSON_FEED_PAGE_LIMIT = 20

export function usePersonDetail(
  personId: number,
  feedRange: PersonMentionsRange,
  focusStatementId: string | null = null,
) {
  const factory = useCallback(
    () => fetchPersonMentionsFeedPage(personId, { range: feedRange, limit: PERSON_FEED_PAGE_LIMIT }),
    [personId, feedRange],
  )
  const asyncResult = useAsyncData<PersonMentionsFeedData>(factory, {
    // `?statementId=` 진입은 around만 — cursor 첫 페이지와 경쟁하지 않음
    enabled: personId > 0 && !focusStatementId,
    keepPreviousData: true,
    minLoadingMs: 0,
  })

  const initialFeed = asyncResult.data
  const initialMentions = useMemo(
    () => initialFeed?.mentions ?? [],
    [initialFeed?.mentions],
  )
  const initialPagination = useMemo(
    () => ({
      nextCursor: initialFeed?.mentionsNextCursor ?? null,
      hasNext: initialFeed?.mentionsHasNext ?? false,
    }),
    [initialFeed?.mentionsNextCursor, initialFeed?.mentionsHasNext],
  )

  const fetchAround = useCallback(
    async (statementId: string) => {
      const page = await fetchPersonMentionsAround(personId, statementId, {
        range: feedRange,
        limit: ANCHORED_FEED_PAGE_LIMIT,
      })
      const mapped = mapPersonMentionsAround(page)
      return { items: mapped.mentions, pagination: mapped.anchoredPagination }
    },
    [personId, feedRange],
  )

  const fetchNewer = useCallback(
    async (cursor: string) => {
      const page = await fetchPersonMentionsNewer(personId, {
        cursor,
        range: feedRange,
        limit: ANCHORED_FEED_PAGE_LIMIT,
      })
      const mapped = mapPersonMentionsAround(page)
      return { items: mapped.mentions, pagination: mapped.anchoredPagination }
    },
    [personId, feedRange],
  )

  const fetchOlder = useCallback(
    async (cursor: string) => {
      const page = await fetchPersonMentionsOlder(personId, {
        cursor,
        range: feedRange,
        limit: ANCHORED_FEED_PAGE_LIMIT,
      })
      const mapped = mapPersonMentionsAround(page)
      return { items: mapped.mentions, pagination: mapped.anchoredPagination }
    },
    [personId, feedRange],
  )

  const {
    items: mentionItems,
    feedMode,
    latestPagination,
    loadingAround,
    loadingNewer,
    loadingOlder,
    aroundError,
    anchoredWarmComplete,
    hasMoreDown,
    hasMoreUp,
    loadNewer,
    loadOlder,
    appendLatestItems,
  } = useAnchoredFeed({
    scopeKey: `${personId}:${feedRange}`,
    anchorId: focusStatementId,
    initialItems: initialMentions,
    initialLatestPagination: initialPagination,
    anchoredEnabled: Boolean(focusStatementId),
    fetchAround,
    fetchNewer,
    fetchOlder,
  })

  const displayData = useMemo<PersonMentionsFeedData | null>(() => {
    if (!asyncResult.data && mentionItems.length === 0) return null
    return {
      mentions: mentionItems,
      mentionsNextCursor: latestPagination.nextCursor,
      mentionsHasNext: feedMode === 'latest' && latestPagination.hasNext,
    }
  }, [asyncResult.data, mentionItems, latestPagination, feedMode])

  const [loadingLatestMore, setLoadingLatestMore] = useState(false)

  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const loadNewerWithError = useCallback(async () => {
    setLoadMoreError(null)
    try {
      await loadNewer()
    } catch (e) {
      setLoadMoreError(e instanceof Error ? e.message : '발언을 더 불러오지 못했습니다.')
    }
  }, [loadNewer])

  const loadMore = useCallback(async () => {
    if (feedMode === 'anchored') {
      setLoadMoreError(null)
      try {
        await loadOlder()
      } catch (e) {
        setLoadMoreError(e instanceof Error ? e.message : '발언을 더 불러오지 못했습니다.')
      }
      return
    }

    if (!latestPagination.hasNext || !latestPagination.nextCursor || loadingLatestMore) return

    setLoadingLatestMore(true)
    try {
      const chunk = await fetchPersonMentionsCursorByPersonId(personId, {
        cursor: latestPagination.nextCursor,
        limit: PERSON_FEED_PAGE_LIMIT,
        range: feedRange,
      })
      appendLatestItems(chunk.items.map(mapPersonStatement), {
        nextCursor: chunk.nextCursor ?? null,
        hasNext: chunk.hasNext ?? false,
      })
    } finally {
      setLoadingLatestMore(false)
    }
  }, [
    feedMode,
    loadOlder,
    latestPagination,
    loadingLatestMore,
    personId,
    feedRange,
    appendLatestItems,
  ])

  return {
    data: displayData,
    loading: asyncResult.loading || asyncResult.refreshing,
    isInitialLoading: asyncResult.loading && displayData == null,
    error: asyncResult.error,
    feedMode,
    hasMoreUp,
    hasMoreDown,
    loadingAround,
    loadingNewer,
    loadNewer: loadNewerWithError,
    loadMore,
    loadMoreError,
    loadingMore: feedMode === 'anchored' ? loadingOlder : loadingLatestMore,
    aroundError,
    anchoredWarmComplete,
  }
}
