import { useCallback } from 'react'
import { fetchPersonMentionCountByPersonId } from '../data/clients/personClient'
import type { PersonMentionsRange } from '../data/types/person'
import { useAsyncData } from './useAsyncData'

export function usePersonMentionCount(personId: number, range: PersonMentionsRange) {
  const factory = useCallback(async () => {
    const res = await fetchPersonMentionCountByPersonId(personId, { range })
    return res.mentionCount
  }, [personId, range])

  return useAsyncData<number>(factory, { enabled: personId > 0 })
}
