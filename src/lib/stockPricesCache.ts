import type { StockPricesResponse } from '../data/types/stockApi'
import { STOCK_PRICE_POLL_INTERVAL_MS } from './pollingSchedule'

/** 백엔드·TickerBar 5분 폴링과 동일 — 구간 내 `/stocks/prices` HTTP 1회 */
const STOCK_PRICES_CACHE_TTL_MS = STOCK_PRICE_POLL_INTERVAL_MS

type CacheEntry = {
  data: StockPricesResponse
  expiresAt: number
}

let cached: CacheEntry | null = null
let inFlight: Promise<StockPricesResponse> | null = null

function isFresh(entry: CacheEntry | null): entry is CacheEntry {
  return entry != null && entry.expiresAt > Date.now()
}

/**
 * `GET /api/v1/stocks/prices` in-flight 병합 + TTL 캐시.
 * codes 필터는 호출측(mapStockPricesToTickerRows)에서 처리.
 */
export function loadStockPricesResponse(
  fetcher: () => Promise<StockPricesResponse>,
): Promise<StockPricesResponse> {
  if (isFresh(cached)) {
    return Promise.resolve(cached.data)
  }

  if (inFlight) {
    return inFlight
  }

  inFlight = fetcher()
    .then((data) => {
      cached = { data, expiresAt: Date.now() + STOCK_PRICES_CACHE_TTL_MS }
      return data
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}
