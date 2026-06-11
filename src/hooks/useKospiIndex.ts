import { useCallback, useEffect, useState } from 'react'
import { fetchKospiIndex } from '../data/clients/stockClient'
import type { KospiIndexQuote } from '../data/types/stock'
import {
  msUntilNextWallClockInterval,
  STOCK_PRICE_POLL_INTERVAL_MS,
  STOCK_PRICE_POLL_LAG_MS,
} from '../lib/pollingSchedule'
import { useAsyncData } from './useAsyncData'

export function useKospiIndex() {
  const [pollTick, setPollTick] = useState(0)
  const factory = useCallback(() => fetchKospiIndex(), [pollTick])

  const state = useAsyncData<KospiIndexQuote>(factory, {
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
