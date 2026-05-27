import { useCallback, useEffect, useState } from 'react'
import { fetchStockOverview, fetchStockRankings } from '../data/clients/stockClient'
import type { StockOverview, StockRankings } from '../data/types/stock'
import {
  msUntilNextWallClockInterval,
  STOCK_PRICE_POLL_INTERVAL_MS,
  STOCK_PRICE_POLL_LAG_MS,
} from '../lib/pollingSchedule'
import { useAsyncData } from './useAsyncData'

export interface StockListPageData {
  overview: StockOverview
  rankings: StockRankings
}

export function useStockListPageData() {
  const [pollTick, setPollTick] = useState(0)
  const factory = useCallback(async (): Promise<StockListPageData> => {
    const [overview, rankings] = await Promise.all([fetchStockOverview(), fetchStockRankings()])
    return { overview, rankings }
  }, [pollTick])

  const state = useAsyncData(factory, {
    keepPreviousData: true,
    minLoadingMs: 0,
  })

  useEffect(() => {
    let timeoutId = 0
    let intervalId = 0

    const bump = () => setPollTick((value) => value + 1)

    const delay = msUntilNextWallClockInterval(
      STOCK_PRICE_POLL_INTERVAL_MS,
      STOCK_PRICE_POLL_LAG_MS,
    )
    timeoutId = window.setTimeout(() => {
      bump()
      intervalId = window.setInterval(bump, STOCK_PRICE_POLL_INTERVAL_MS)
    }, delay)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [])

  return state
}
