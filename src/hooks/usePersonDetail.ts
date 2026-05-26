import { useCallback, useMemo } from 'react'
import {
  fetchPersonMentionsAround,
  fetchPersonMentionsCursorByPersonId,
  fetchPersonMentionsFeedPage,
  fetchPersonMentionsNewer,
  fetchPersonMentionsOlder,
} from '../data/clients/personClient'
import { mapPersonMentionsAround, mapPersonStatement } from '../data/mappers/personMapper'
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
    enabled: personId > 0,
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
        limit: PERSON_FEED_PAGE_LIMIT,
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
        limit: PERSON_FEED_PAGE_LIMIT,
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
        limit: PERSON_FEED_PAGE_LIMIT,
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

  const loadMore = useCallback(async () => {
    if (feedMode === 'anchored') {
      await loadOlder()
      return
    }

    if (!latestPagination.hasNext || !latestPagination.nextCursor || loadingOlder) return

    const chunk = await fetchPersonMentionsCursorByPersonId(personId, {
      cursor: latestPagination.nextCursor,
      limit: PERSON_FEED_PAGE_LIMIT,
      range: feedRange,
    })
    appendLatestItems(chunk.items.map(mapPersonStatement), {
      nextCursor: chunk.nextCursor ?? null,
      hasNext: chunk.hasNext ?? false,
    })
  }, [
    feedMode,
    loadOlder,
    latestPagination,
    loadingOlder,
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
    loadNewer,
    loadMore,
    loadingMore: loadingOlder,
    aroundError,
  }
}
