import { useCallback } from 'react'
import {
  fetchPersonFrequentStocksByPersonId,
  fetchPersonSidebar,
} from '../data/clients/personClient'
import { mapFrequentStockList } from '../data/mappers/personMapper'
import type { PersonFrequentStock, PersonMentionsRange } from '../data/types/person'
import { useAsyncData } from './useAsyncData'

export function usePersonFrequentStocks(range: PersonMentionsRange, personId?: number) {
  const factory = useCallback(async () => {
    if (personId != null && personId > 0) {
      const rows = await fetchPersonFrequentStocksByPersonId(personId, { range })
      return mapFrequentStockList(rows)
    }
    const sidebar = await fetchPersonSidebar({ range })
    return mapFrequentStockList(sidebar.frequentStocks ?? [])
  }, [range, personId])

  return useAsyncData<PersonFrequentStock[]>(factory, {
    enabled: personId == null || personId > 0,
    keepPreviousData: true,
    minLoadingMs: 0,
  })
}
