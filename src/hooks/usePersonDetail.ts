import { useCallback, useEffect, useState } from 'react'
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
  const asyncResult = useAsyncData<PersonMentionsFeedData>(factory, { enabled: personId > 0 })
  const [viewData, setViewData] = useState<PersonMentionsFeedData | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    setViewData(asyncResult.data)
  }, [asyncResult.data])

  const displayData = viewData ?? asyncResult.data

  const loadMore = useCallback(async () => {
    const base = displayData
    if (!base?.mentionsHasNext || !base.mentionsNextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const chunk = await fetchPersonMentionsCursorByPersonId(personId, {
        cursor: base.mentionsNextCursor,
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
      setLoadingMore(false)
    }
  }, [displayData, loadingMore, asyncResult.data, personId, feedRange])

  return {
    data: displayData,
    loading: asyncResult.loading,
    error: asyncResult.error,
    loadMore,
    loadingMore,
  }
}
