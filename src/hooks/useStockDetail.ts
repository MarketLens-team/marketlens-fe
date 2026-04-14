import { useCallback } from 'react'
import { fetchStockDetail } from '../data/clients/stockClient'
import type { StockDetail } from '../data/types/stock'
import { useAsyncData } from './useAsyncData'

export function useStockDetail(stockCode: string | undefined) {
  const enabled = Boolean(stockCode?.trim())
  const factory = useCallback(() => fetchStockDetail(stockCode!.trim()), [stockCode])
  return useAsyncData<StockDetail>(factory, { enabled })
}
