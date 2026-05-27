import { useCallback } from 'react'
import {
  fetchPersonFrequentStocksByPersonId,
  fetchPersonSidebar,
} from '../data/clients/personClient'
import { mapFrequentStockList } from '../data/mappers/personMapper'
import type { PersonFrequentStock, PersonMentionsRange } from '../data/types/person'
import {
  peekPersonTrackerStocksCache,
  setPersonTrackerStocksCache,
} from '../lib/personTrackerPrefetch'
import { useAsyncData } from './useAsyncData'

export function usePersonFrequentStocks(range: PersonMentionsRange, personId?: number) {
  const isTrackerSidebar = personId == null || personId <= 0

  const factory = useCallback(async () => {
    if (personId != null && personId > 0) {
      const rows = await fetchPersonFrequentStocksByPersonId(personId, { range })
      return mapFrequentStockList(rows)
    }
    const cached = peekPersonTrackerStocksCache(range)
    if (cached) return cached
    const sidebar = await fetchPersonSidebar({ range })
    const mapped = mapFrequentStockList(sidebar.frequentStocks ?? [])
    setPersonTrackerStocksCache(range, mapped)
    return mapped
  }, [range, personId])

  return useAsyncData<PersonFrequentStock[]>(factory, {
    enabled: personId == null || personId > 0,
    keepPreviousData: true,
    minLoadingMs: 0,
    initialData: isTrackerSidebar ? peekPersonTrackerStocksCache(range) : null,
  })
}
