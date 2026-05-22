import { useCallback, useEffect, useState } from 'react'
import {
  fetchPersonDetailPage,
  fetchPersonMentionsCursorByPersonId,
} from '../data/clients/personClient'
import { mergePersonTrackerMentionsPage } from '../data/mappers/personMapper'
import type { PersonDetailPageData, PersonMentionsRange } from '../data/types/person'
import { useAsyncData } from './useAsyncData'

const PERSON_FEED_PAGE_LIMIT = 20

export function usePersonDetail(personId: number, range: PersonMentionsRange) {
  const factory = useCallback(
    () => fetchPersonDetailPage(personId, { range, limit: PERSON_FEED_PAGE_LIMIT }),
    [personId, range],
  )
  const asyncResult = useAsyncData<PersonDetailPageData>(factory, { enabled: personId > 0 })
  const [viewData, setViewData] = useState<PersonDetailPageData | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (asyncResult.data) setViewData(asyncResult.data)
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
        range,
      })
      setViewData((prev) => {
        const p = prev ?? asyncResult.data
        if (!p) return prev
        return mergePersonTrackerMentionsPage(p, chunk.items, {
          nextCursor: chunk.nextCursor ?? null,
          hasNext: chunk.hasNext ?? false,
        })
      })
    } finally {
      setLoadingMore(false)
    }
  }, [displayData, loadingMore, asyncResult.data, personId, range])

  return {
    data: displayData,
    loading: asyncResult.loading,
    error: asyncResult.error,
    loadMore,
    loadingMore,
  }
}
