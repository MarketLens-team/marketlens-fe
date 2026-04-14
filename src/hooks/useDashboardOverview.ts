import { useCallback } from 'react'
import { fetchDashboardOverview } from '../data/clients/dashboardClient'
import type { DashboardOverview } from '../data/types/dashboard'
import { useAsyncData } from './useAsyncData'

export function useDashboardOverview() {
  const factory = useCallback(() => fetchDashboardOverview(), [])
  return useAsyncData<DashboardOverview>(factory)
}
