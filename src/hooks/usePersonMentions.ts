import { useCallback } from 'react'
import { fetchPersonTrackerPage } from '../data/clients/personClient'
import type { PersonMention } from '../data/types/person'
import { useAsyncData } from './useAsyncData'

/** @deprecated usePersonTracker 사용 */
export function usePersonMentions() {
  const factory = useCallback(async () => {
    const page = await fetchPersonTrackerPage()
    return page.mentions
  }, [])
  return useAsyncData<PersonMention[]>(factory)
}
