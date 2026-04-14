import { useCallback } from 'react'
import { fetchBuzzAlerts } from '../data/clients/buzzClient'
import type { BuzzAlert } from '../data/types/buzz'
import { useAsyncData } from './useAsyncData'

export function useBuzzAlerts() {
  const factory = useCallback(() => fetchBuzzAlerts(), [])
  return useAsyncData<BuzzAlert[]>(factory)
}
