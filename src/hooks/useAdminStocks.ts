import { useCallback } from 'react'
import { fetchAdminStocks } from '../data/clients/adminClient'
import type { AdminStockRow } from '../data/types/admin'
import { useAsyncData } from './useAsyncData'

export function useAdminStocks() {
  const factory = useCallback(() => fetchAdminStocks(), [])
  return useAsyncData<AdminStockRow[]>(factory)
}
