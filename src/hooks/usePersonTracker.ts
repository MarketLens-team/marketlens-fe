import { useCallback, useEffect, useState } from 'react'
import { fetchPersonStatementsCursor, fetchPersonTrackerPage } from '../data/clients/personClient'
import { mergePersonTrackerMentionsPage } from '../data/mappers/personMapper'
import type { PersonMentionsRange, PersonTrackerPageData } from '../data/types/person'
import { useAsyncData } from './useAsyncData'

export function usePersonTracker(range: PersonMentionsRange) {
  const factory = useCallback(() => fetchPersonTrackerPage({ range }), [range])
  const asyncResult = useAsyncData<PersonTrackerPageData>(factory)
  const [viewData, setViewData] = useState<PersonTrackerPageData | null>(null)
  const [loadingMoreMentions, setLoadingMoreMentions] = useState(false)

  useEffect(() => {
    if (asyncResult.data) setViewData(asyncResult.data)
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
      setLoadingMoreMentions(false)
    }
  }, [displayData, loadingMoreMentions, asyncResult.data, range])

  return {
    data: displayData,
    loading: asyncResult.loading,
    error: asyncResult.error,
    loadMoreMentions,
    loadingMoreMentions,
  }
}
