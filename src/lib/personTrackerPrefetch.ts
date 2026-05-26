import {
  fetchPersonTrackerFeedPage,
  fetchPersonTopMentioned,
  fetchPersonSidebar,
} from '../data/clients/personClient'
import { mapFrequentStockList, mapPersonTopItem } from '../data/mappers/personMapper'
import type {
  PersonFrequentStock,
  PersonMentionsFeedData,
  PersonMentionsRange,
  PersonTopItem,
} from '../data/types/person'

const CACHE_TTL_MS = 60_000

/** 인물 발언 트래커 기본 기간 — prefetch·초기 진입과 동일 */
export const PERSON_TRACKER_PREFETCH_RANGE: PersonMentionsRange = 'today'

type CacheEntry<T> = {
  data: T
  expiresAt: number
}

const feedByRange = new Map<PersonMentionsRange, CacheEntry<PersonMentionsFeedData>>()
const topByRange = new Map<PersonMentionsRange, CacheEntry<PersonTopItem[]>>()
const stocksByRange = new Map<PersonMentionsRange, CacheEntry<PersonFrequentStock[]>>()

function isFresh<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  return entry != null && entry.expiresAt > Date.now()
}

function writeCache<T>(map: Map<PersonMentionsRange, CacheEntry<T>>, range: PersonMentionsRange, data: T) {
  map.set(range, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

export function peekPersonTrackerFeedCache(range: PersonMentionsRange): PersonMentionsFeedData | null {
  const entry = feedByRange.get(range)
  return isFresh(entry) ? entry.data : null
}

export function setPersonTrackerFeedCache(range: PersonMentionsRange, data: PersonMentionsFeedData) {
  writeCache(feedByRange, range, data)
}

export function peekPersonTrackerTopCache(range: PersonMentionsRange): PersonTopItem[] | null {
  const entry = topByRange.get(range)
  return isFresh(entry) ? entry.data : null
}

export function setPersonTrackerTopCache(range: PersonMentionsRange, data: PersonTopItem[]) {
  writeCache(topByRange, range, data)
}

export function peekPersonTrackerStocksCache(range: PersonMentionsRange): PersonFrequentStock[] | null {
  const entry = stocksByRange.get(range)
  return isFresh(entry) ? entry.data : null
}

export function setPersonTrackerStocksCache(range: PersonMentionsRange, data: PersonFrequentStock[]) {
  writeCache(stocksByRange, range, data)
}

function isTrackerBundleCached(range: PersonMentionsRange) {
  return (
    peekPersonTrackerFeedCache(range) != null &&
    peekPersonTrackerTopCache(range) != null &&
    peekPersonTrackerStocksCache(range) != null
  )
}

let prefetchInFlight: Promise<void> | null = null

/** TopNav hover 등 — `/person` 진입 전 데이터 선로드 */
export function prefetchPersonTracker(range: PersonMentionsRange = PERSON_TRACKER_PREFETCH_RANGE): void {
  if (isTrackerBundleCached(range)) return
  if (prefetchInFlight) return

  prefetchInFlight = (async () => {
    const [feed, topRows, sidebar] = await Promise.all([
      fetchPersonTrackerFeedPage({ range }),
      fetchPersonTopMentioned({ range }),
      fetchPersonSidebar({ range }),
    ])
    setPersonTrackerFeedCache(range, feed)
    setPersonTrackerTopCache(range, topRows.map(mapPersonTopItem))
    setPersonTrackerStocksCache(range, mapFrequentStockList(sidebar.frequentStocks ?? []))
  })()
    .catch(() => {
      /* prefetch 실패는 조용히 — 페이지 진입 시 정상 fetch */
    })
    .finally(() => {
      prefetchInFlight = null
    })
}
