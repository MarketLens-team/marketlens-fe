import { useCallback } from 'react'
import { fetchDashboardBriefing } from '../data/clients/dashboardClient'
import type { DashboardBriefing } from '../data/types/dashboard'
import { useAsyncData } from './useAsyncData'

export function useDashboardBriefing(enabled: boolean) {
  const factory = useCallback(() => fetchDashboardBriefing(), [])
  return useAsyncData<DashboardBriefing | null>(factory, { enabled })
}
