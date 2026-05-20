import { useCallback } from 'react'
import { fetchBuzzSurge } from '../data/clients/buzzSurgeClient'
import type { BuzzSurgePage } from '../data/types/buzzSurge'
import { useAsyncData } from './useAsyncData'

export function useBuzzSurge() {
  const factory = useCallback(() => fetchBuzzSurge(), [])
  return useAsyncData<BuzzSurgePage>(factory)
}
