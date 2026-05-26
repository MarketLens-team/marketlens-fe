import { useCallback } from 'react'
import { fetchPersonTopMentioned } from '../data/clients/personClient'
import { mapPersonTopItem } from '../data/mappers/personMapper'
import type { PersonMentionsRange, PersonTopItem } from '../data/types/person'
import {
  peekPersonTrackerTopCache,
  setPersonTrackerTopCache,
} from '../lib/personTrackerPrefetch'
import { useAsyncData } from './useAsyncData'

export function usePersonTopMentioned(range: PersonMentionsRange) {
  const factory = useCallback(async () => {
    const cached = peekPersonTrackerTopCache(range)
    if (cached) return cached
    const rows = await fetchPersonTopMentioned({ range })
    const mapped = rows.map(mapPersonTopItem)
    setPersonTrackerTopCache(range, mapped)
    return mapped
  }, [range])

  return useAsyncData<PersonTopItem[]>(factory, {
    keepPreviousData: true,
    minLoadingMs: 0,
    initialData: peekPersonTrackerTopCache(range),
  })
}
