import { useCallback } from 'react'
import { fetchAdminOverview } from '../data/clients/adminClient'
import type { AdminOverview } from '../data/types/admin'
import { useAsyncData } from './useAsyncData'

export function useAdminOverview() {
  const factory = useCallback(() => fetchAdminOverview(), [])
  return useAsyncData<AdminOverview>(factory)
}
