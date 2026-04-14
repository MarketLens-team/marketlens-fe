import { useCallback } from 'react'
import { fetchAdminCrawlingLogs } from '../data/clients/adminClient'
import type { CrawlingLog } from '../data/types/admin'
import { useAsyncData } from './useAsyncData'

export function useAdminCrawlingLogs() {
  const factory = useCallback(() => fetchAdminCrawlingLogs(), [])
  return useAsyncData<CrawlingLog[]>(factory)
}
