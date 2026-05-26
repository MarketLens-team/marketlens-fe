import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPersonMentionsFeedPage, fetchPersonMentionsCursorByPersonId } from '../data/clients/personClient'
import { mergePersonMentionsFeedPage } from '../data/mappers/personMapper'
import type { PersonMentionsFeedData, PersonMentionsRange } from '../data/types/person'
import { useAsyncData } from './useAsyncData'

const PERSON_FEED_PAGE_LIMIT = 20

export function usePersonDetail(personId: number, feedRange: PersonMentionsRange) {
  const factory = useCallback(
    () => fetchPersonMentionsFeedPage(personId, { range: feedRange, limit: PERSON_FEED_PAGE_LIMIT }),
    [personId, feedRange],
  )
  const asyncResult = useAsyncData<PersonMentionsFeedData>(factory, {
    enabled: personId > 0,
    keepPreviousData: true,
    minLoadingMs: 0,
  })
  const [viewData, setViewData] = useState<PersonMentionsFeedData | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadMoreInFlightRef = useRef(false)

  useEffect(() => {
    if (asyncResult.data) setViewData(asyncResult.data)
  }, [asyncResult.data])

  const displayData = asyncResult.refreshing
    ? asyncResult.data
    : (viewData ?? asyncResult.data)

  const loadMore = useCallback(async () => {
    if (loadMoreInFlightRef.current) return
    const base = displayData
    if (!base?.mentionsHasNext || !base.mentionsNextCursor) return

    const cursorUsed = base.mentionsNextCursor
    loadMoreInFlightRef.current = true
    setLoadingMore(true)
    try {
      const chunk = await fetchPersonMentionsCursorByPersonId(personId, {
        cursor: cursorUsed,
        limit: PERSON_FEED_PAGE_LIMIT,
        range: feedRange,
      })
      setViewData((prev) => {
        const p = prev ?? asyncResult.data
        if (!p) return prev
        return mergePersonMentionsFeedPage(p, chunk.items, {
          nextCursor: chunk.nextCursor ?? null,
          hasNext: chunk.hasNext ?? false,
        })
      })
    } finally {
      loadMoreInFlightRef.current = false
      setLoadingMore(false)
    }
  }, [displayData, asyncResult.data, personId, feedRange])

  return {
    data: displayData,
    loading: asyncResult.loading || asyncResult.refreshing,
    isInitialLoading: asyncResult.loading && displayData == null,
    error: asyncResult.error,
    loadMore,
    loadingMore,
  }
}
