import { useCallback } from 'react'
import { fetchPersonTrackerPage } from '../data/clients/personClient'
import type { PersonTrackerPageData } from '../data/types/person'
import { useAsyncData } from './useAsyncData'

export function usePersonTracker() {
  const factory = useCallback(() => fetchPersonTrackerPage(), [])
  return useAsyncData<PersonTrackerPageData>(factory)
}
