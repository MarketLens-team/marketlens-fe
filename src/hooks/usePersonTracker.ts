import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchPersonStatementsCursor,
  fetchPersonTrackerFeedPage,
} from '../data/clients/personClient'
import { mergePersonMentionsFeedPage } from '../data/mappers/personMapper'
import type { PersonMentionsFeedData, PersonMentionsRange } from '../data/types/person'
import {
  peekPersonTrackerFeedCache,
  setPersonTrackerFeedCache,
} from '../lib/personTrackerPrefetch'
import { useAsyncData } from './useAsyncData'

export function usePersonTracker(feedRange: PersonMentionsRange) {
  const factory = useCallback(async () => {
    const cached = peekPersonTrackerFeedCache(feedRange)
    if (cached) return cached
    const next = await fetchPersonTrackerFeedPage({ range: feedRange })
    setPersonTrackerFeedCache(feedRange, next)
    return next
  }, [feedRange])
  const asyncResult = useAsyncData<PersonMentionsFeedData>(factory, {
    keepPreviousData: true,
    minLoadingMs: 0,
    initialData: peekPersonTrackerFeedCache(feedRange),
  })
  const [viewData, setViewData] = useState<PersonMentionsFeedData | null>(null)
  const [loadingMoreMentions, setLoadingMoreMentions] = useState(false)
  const loadMoreInFlightRef = useRef(false)

  useEffect(() => {
    if (asyncResult.data) setViewData(asyncResult.data)
  }, [asyncResult.data])

  const displayData = asyncResult.refreshing
    ? asyncResult.data
    : (viewData ?? asyncResult.data)

  const loadMoreMentions = useCallback(async () => {
    if (loadMoreInFlightRef.current) return
    const base = displayData
    if (!base?.mentionsHasNext || !base.mentionsNextCursor) return

    const cursorUsed = base.mentionsNextCursor
    loadMoreInFlightRef.current = true
    setLoadingMoreMentions(true)
    try {
      const chunk = await fetchPersonStatementsCursor({
        cursor: cursorUsed,
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
      loadMoreInFlightRef.current = false
      setLoadingMoreMentions(false)
    }
  }, [displayData, asyncResult.data, feedRange])

  return {
    data: displayData,
    loading: asyncResult.loading || asyncResult.refreshing,
    isInitialLoading: asyncResult.loading && displayData == null,
    error: asyncResult.error,
    loadMoreMentions,
    loadingMoreMentions,
  }
}
