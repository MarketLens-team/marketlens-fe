import { useCallback } from 'react'
import { fetchPersonTopMentioned } from '../data/clients/personClient'
import { mapPersonTopItem } from '../data/mappers/personMapper'
import type { PersonMentionsRange, PersonTopItem } from '../data/types/person'
import { useAsyncData } from './useAsyncData'

export function usePersonTopMentioned(range: PersonMentionsRange) {
  const factory = useCallback(async () => {
    const rows = await fetchPersonTopMentioned({ range })
    return rows.map(mapPersonTopItem)
  }, [range])

  return useAsyncData<PersonTopItem[]>(factory)
}
