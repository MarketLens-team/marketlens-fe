import { useCallback, useEffect, useState } from 'react'
import {
  fetchPersonStatementsCursor,
  fetchPersonTrackerFeedPage,
} from '../data/clients/personClient'
import { mergePersonMentionsFeedPage } from '../data/mappers/personMapper'
import type { PersonMentionsFeedData, PersonMentionsRange } from '../data/types/person'
import { useAsyncData } from './useAsyncData'

export function usePersonTracker(feedRange: PersonMentionsRange) {
  const factory = useCallback(() => fetchPersonTrackerFeedPage({ range: feedRange }), [feedRange])
  const asyncResult = useAsyncData<PersonMentionsFeedData>(factory)
  const [viewData, setViewData] = useState<PersonMentionsFeedData | null>(null)
  const [loadingMoreMentions, setLoadingMoreMentions] = useState(false)

  useEffect(() => {
    setViewData(asyncResult.data)
  }, [asyncResult.data])

  const displayData = viewData ?? asyncResult.data

  const loadMoreMentions = useCallback(async () => {
    const base = displayData
    if (!base?.mentionsHasNext || !base.mentionsNextCursor || loadingMoreMentions) return
    setLoadingMoreMentions(true)
    try {
      const chunk = await fetchPersonStatementsCursor({
        cursor: base.mentionsNextCursor,
        limit: 50,
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
      setLoadingMoreMentions(false)
    }
  }, [displayData, loadingMoreMentions, asyncResult.data, feedRange])

  return {
    data: displayData,
    loading: asyncResult.loading,
    error: asyncResult.error,
    loadMoreMentions,
    loadingMoreMentions,
  }
}
