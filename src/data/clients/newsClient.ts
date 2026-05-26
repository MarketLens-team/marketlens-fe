import { isMockDataSource } from '../../config/dataSource'
import { mapNewsFeedItems } from '../mappers/stockMapper'
import { mockNewsFeed } from '../mocks/news.mock'
import { mockStockDetails } from '../mocks/stock.mock'
import type { ApiEnvelope } from '../types/api'
import type { NewsFeedItem } from '../types/news'
import type {
  NewsFeedAroundResponse,
  NewsFeedCursorResponse,
  NewsFeedItemResponse,
} from '../types/stockApi'
import type { StockNewsItem, StockNewsPagination } from '../types/stock'
import { appendNewsCursorParam } from '../../lib/encodeNewsCursor'
import { api } from '../../services/api'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

/** 대시보드 목 데이터용 — `NewsFeedItem` 스키마 */
const LEGACY_FEED_PATH = '/api/v1/news/feed'

export async function fetchNewsFeed(): Promise<NewsFeedItem[]> {
  if (isMockDataSource()) {
    await mockDelay()
    return structuredClone(mockNewsFeed)
  }
  const { data } = await api.get<NewsFeedItem[]>(LEGACY_FEED_PATH)
  return data
}

const ALL_FEED_PATH = '/api/v1/news/feed/all'
const WATCHLIST_FEED_PATH = '/api/v1/news/feed/watchlist'
/** 전체·관심 공통 anchored — `around` / `newer` / `older` (종목 `{ticker}` 아님) */
const NEWS_FEED_ANCHORED_PATH = '/api/v1/news/feed'
const DEFAULT_NEWS_CURSOR_LIMIT = 20

export interface FetchAllNewsFeedCursorParams {
  limit?: number
  cursor?: string
  sentiment?: string
}

export interface FetchNewsFeedAnchoredParams {
  limit?: number
  cursor?: string
  sentiment?: string
}

export interface AllNewsFeedPage {
  items: StockNewsItem[]
  pagination: StockNewsPagination
}

function parseMockNewsCursorOffset(cursor: string | undefined): number {
  if (!cursor) return 0
  const pipe = cursor.lastIndexOf('|')
  if (pipe < 0) return 0
  const offset = Number(cursor.slice(pipe + 1))
  return Number.isFinite(offset) && offset >= 0 ? offset : 0
}

/** mock anchored 커서 `publishedAt|newsId` → 목록 인덱스 */
function parseMockNewsFeedAnchorIndex(all: NewsFeedItemResponse[], cursor: string): number {
  const pipe = cursor.lastIndexOf('|')
  if (pipe < 0) return 0
  const id = Number(cursor.slice(pipe + 1))
  if (!Number.isFinite(id)) return 0
  const index = all.findIndex((item) => item.id === id)
  return index >= 0 ? index : 0
}

function buildMockNewsCursor(
  allItems: NewsFeedItemResponse[],
  offset: number,
): string | null {
  if (offset < 0 || offset >= allItems.length) return null
  const anchor = allItems[offset]
  return `${anchor.publishedAt}|${anchor.id}`
}

function mockNewsFeedAroundSlice(
  all: NewsFeedItemResponse[],
  anchorIndex: number,
  limit: number,
): NewsFeedAroundResponse {
  if (anchorIndex < 0) {
    return {
      items: [],
      newerCursor: null,
      hasNewer: false,
      olderCursor: null,
      hasOlder: false,
    }
  }
  const half = Math.floor(limit / 2)
  const start = Math.max(0, anchorIndex - half)
  const end = Math.min(all.length, start + limit)
  const items = all.slice(start, end)
  const hasNewer = start > 0
  const hasOlder = end < all.length
  return {
    items,
    newerCursor: hasNewer ? buildMockNewsCursor(all, start) : null,
    hasNewer,
    olderCursor: hasOlder ? buildMockNewsCursor(all, end - 1) : null,
    hasOlder,
  }
}

function mockNewsFeedNewerSlice(
  all: NewsFeedItemResponse[],
  cursor: string,
  limit: number,
): NewsFeedAroundResponse {
  const end = parseMockNewsFeedAnchorIndex(all, cursor)
  const start = Math.max(0, end - limit)
  const items = all.slice(start, end)
  const hasNewer = start > 0
  return {
    items,
    newerCursor: hasNewer ? buildMockNewsCursor(all, start) : null,
    hasNewer,
    olderCursor: items.length > 0 ? buildMockNewsCursor(all, end - 1) : null,
    hasOlder: end < all.length,
  }
}

function mockNewsFeedOlderSlice(
  all: NewsFeedItemResponse[],
  cursor: string,
  limit: number,
): NewsFeedAroundResponse {
  const anchorIndex = parseMockNewsFeedAnchorIndex(all, cursor)
  const start = anchorIndex + 1
  const end = Math.min(all.length, start + limit)
  const items = all.slice(start, end)
  const hasOlder = end < all.length
  return {
    items,
    newerCursor: items.length > 0 ? buildMockNewsCursor(all, start) : null,
    hasNewer: start > 0,
    olderCursor: hasOlder ? buildMockNewsCursor(all, end - 1) : null,
    hasOlder,
  }
}

function buildNewsFeedAnchoredQuery(params?: FetchNewsFeedAnchoredParams): URLSearchParams {
  const searchParams = new URLSearchParams()
  const limit = params?.limit ?? DEFAULT_NEWS_CURSOR_LIMIT
  searchParams.set('limit', String(limit))
  if (params?.sentiment) searchParams.set('sentiment', params.sentiment)
  if (params?.cursor) appendNewsCursorParam(searchParams, params.cursor)
  return searchParams
}

async function fetchNewsFeedAnchored(
  pathWithoutQuery: string,
  params: FetchNewsFeedAnchoredParams | undefined,
  fallbackMessage: string,
): Promise<NewsFeedAroundResponse> {
  const query = buildNewsFeedAnchoredQuery(params).toString()
  const path = `${pathWithoutQuery}${query ? `?${query}` : ''}`

  try {
    const { data } = await api.get<ApiEnvelope<NewsFeedAroundResponse>>(path)
    return unwrapApiEnvelope(data, fallbackMessage)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage))
  }
}

function mapStockNewsToFeedResponse(
  stockCode: string,
  stockName: string,
): NewsFeedItemResponse[] {
  const detail = mockStockDetails[stockCode]
  if (!detail) return []

  return detail.recentNews.map((item, index) => ({
    id: Number(item.id.replace(/\D/g, '')) || index,
    title: item.title,
    description: item.description ?? '',
    originalLink: item.url ?? '',
    source: item.source,
    publishedAt: item.publishedAt,
    imageUrl: item.imageUrl ?? '',
    sentimentScore: item.sentimentScore,
    sentiment: item.sentiment,
    relatedStocks: [
      {
        stockCode,
        stockName,
        imageUrl: `/images/stocks/${stockCode}.svg`,
        relevanceScore: 1,
      },
      ...detail.relatedStocks.slice(0, 2).map((related, i) => ({
        stockCode: related.code,
        stockName: related.name,
        imageUrl: related.imageUrl ?? `/images/stocks/${related.code}.svg`,
        relevanceScore: 0.85 - i * 0.1,
      })),
    ],
  }))
}

function buildMockAllNewsFeedItems(): NewsFeedItemResponse[] {
  const seen = new Set<string>()
  const items: NewsFeedItemResponse[] = []

  for (const detail of Object.values(mockStockDetails)) {
    const mapped = mapStockNewsToFeedResponse(detail.stock.code, detail.stock.name)
    for (const item of mapped) {
      const key = `${item.id}-${detail.stock.code}`
      if (seen.has(key)) continue
      seen.add(key)
      items.push(item)
    }
  }

  return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

async function fetchNewsFeedCursorPage(
  basePath: string,
  params: FetchAllNewsFeedCursorParams | undefined,
  fallbackMessage: string,
): Promise<AllNewsFeedPage> {
  const limit = params?.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  const searchParams = new URLSearchParams()
  searchParams.set('limit', String(limit))
  if (params?.sentiment) searchParams.set('sentiment', params.sentiment)
  if (params?.cursor) appendNewsCursorParam(searchParams, params.cursor)

  const query = searchParams.toString()
  const path = `${basePath}/cursor${query ? `?${query}` : ''}`

  try {
    const { data } = await api.get<ApiEnvelope<NewsFeedCursorResponse>>(path)
    const page = unwrapApiEnvelope(data, fallbackMessage)
    return {
      items: mapNewsFeedItems(page.items),
      pagination: {
        nextCursor: page.nextCursor,
        hasNext: page.hasNext,
      },
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage))
  }
}

function fetchMockNewsFeedCursorPage(
  params: FetchAllNewsFeedCursorParams | undefined,
  sourceItems: NewsFeedItemResponse[],
): AllNewsFeedPage {
  const limit = params?.limit ?? DEFAULT_NEWS_CURSOR_LIMIT
  const offset = parseMockNewsCursorOffset(params?.cursor)
  let filtered = sourceItems
  if (params?.sentiment && params.sentiment !== 'all') {
    filtered = sourceItems.filter((item) => item.sentiment === params.sentiment)
  }
  const slice = filtered.slice(offset, offset + limit)
  const nextOffset = offset + slice.length
  const hasNext = nextOffset < filtered.length
  return {
    items: mapNewsFeedItems(slice),
    pagination: {
      nextCursor: hasNext ? buildMockNewsCursor(filtered, nextOffset) : null,
      hasNext,
    },
  }
}

/** OpenAPI `GET /api/v1/news/feed/all/cursor` */
export async function fetchAllNewsFeedCursor(
  params?: FetchAllNewsFeedCursorParams,
): Promise<AllNewsFeedPage> {
  if (isMockDataSource()) {
    await mockDelay(100)
    return fetchMockNewsFeedCursorPage(params, buildMockAllNewsFeedItems())
  }
  return fetchNewsFeedCursorPage(ALL_FEED_PATH, params, '전체 뉴스를 불러오지 못했습니다.')
}

/** OpenAPI `GET /api/v1/news/feed/watchlist/cursor` */
export async function fetchWatchlistNewsFeedCursor(
  params?: FetchAllNewsFeedCursorParams,
): Promise<AllNewsFeedPage> {
  if (isMockDataSource()) {
    await mockDelay(100)
    const all = buildMockAllNewsFeedItems()
    const watchlistCodes = new Set(['005930', '000660', '035420'])
    const filtered = all.filter((item) =>
      item.relatedStocks?.some((stock) => watchlistCodes.has(stock.stockCode)),
    )
    return fetchMockNewsFeedCursorPage(params, filtered)
  }
  return fetchNewsFeedCursorPage(
    WATCHLIST_FEED_PATH,
    params,
    '관심종목 뉴스를 불러오지 못했습니다.',
  )
}

function getMockNewsFeedSource(mode: 'all' | 'watchlist'): NewsFeedItemResponse[] {
  const all = buildMockAllNewsFeedItems()
  if (mode === 'all') return all
  const watchlistCodes = new Set(['005930', '000660', '035420'])
  return all.filter((item) =>
    item.relatedStocks?.some((stock) => watchlistCodes.has(stock.stockCode)),
  )
}

/** OpenAPI `GET /api/v1/news/feed/around/{newsId}` */
export async function fetchAllNewsFeedAround(
  newsId: string,
  params?: Omit<FetchNewsFeedAnchoredParams, 'cursor'>,
): Promise<NewsFeedAroundResponse> {
  const limit = params?.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = getMockNewsFeedSource('all')
    const targetId = Number(newsId)
    const anchorIndex = all.findIndex((item) => item.id === targetId)
    return mockNewsFeedAroundSlice(all, anchorIndex, limit)
  }

  return fetchNewsFeedAnchored(
    `${NEWS_FEED_ANCHORED_PATH}/around/${encodeURIComponent(newsId)}`,
    params,
    '전체 뉴스를 불러오지 못했습니다.',
  )
}

/** OpenAPI `GET /api/v1/news/feed/newer` */
export async function fetchAllNewsFeedNewer(
  params: FetchNewsFeedAnchoredParams,
): Promise<NewsFeedAroundResponse> {
  const limit = params.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = getMockNewsFeedSource('all')
    if (!params.cursor) {
      return {
        items: [],
        newerCursor: null,
        hasNewer: false,
        olderCursor: null,
        hasOlder: false,
      }
    }
    return mockNewsFeedNewerSlice(all, params.cursor, limit)
  }

  return fetchNewsFeedAnchored(
    `${NEWS_FEED_ANCHORED_PATH}/newer`,
    params,
    '전체 뉴스를 더 불러오지 못했습니다.',
  )
}

/** OpenAPI `GET /api/v1/news/feed/older` */
export async function fetchAllNewsFeedOlder(
  params: FetchNewsFeedAnchoredParams,
): Promise<NewsFeedAroundResponse> {
  const limit = params.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = getMockNewsFeedSource('all')
    if (!params.cursor) {
      return {
        items: [],
        newerCursor: null,
        hasNewer: false,
        olderCursor: null,
        hasOlder: false,
      }
    }
    return mockNewsFeedOlderSlice(all, params.cursor, limit)
  }

  return fetchNewsFeedAnchored(
    `${NEWS_FEED_ANCHORED_PATH}/older`,
    params,
    '전체 뉴스를 더 불러오지 못했습니다.',
  )
}

/** 관심 탭 — anchored 경로는 전체 뉴스와 동일 (`/feed/around` 등) */
export async function fetchWatchlistNewsFeedAround(
  newsId: string,
  params?: Omit<FetchNewsFeedAnchoredParams, 'cursor'>,
): Promise<NewsFeedAroundResponse> {
  const limit = params?.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = getMockNewsFeedSource('watchlist')
    const targetId = Number(newsId)
    const anchorIndex = all.findIndex((item) => item.id === targetId)
    return mockNewsFeedAroundSlice(all, anchorIndex, limit)
  }

  return fetchNewsFeedAnchored(
    `${NEWS_FEED_ANCHORED_PATH}/around/${encodeURIComponent(newsId)}`,
    params,
    '관심종목 뉴스를 불러오지 못했습니다.',
  )
}

export async function fetchWatchlistNewsFeedNewer(
  params: FetchNewsFeedAnchoredParams,
): Promise<NewsFeedAroundResponse> {
  const limit = params.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = getMockNewsFeedSource('watchlist')
    if (!params.cursor) {
      return {
        items: [],
        newerCursor: null,
        hasNewer: false,
        olderCursor: null,
        hasOlder: false,
      }
    }
    return mockNewsFeedNewerSlice(all, params.cursor, limit)
  }

  return fetchNewsFeedAnchored(
    `${NEWS_FEED_ANCHORED_PATH}/newer`,
    params,
    '관심종목 뉴스를 더 불러오지 못했습니다.',
  )
}

export async function fetchWatchlistNewsFeedOlder(
  params: FetchNewsFeedAnchoredParams,
): Promise<NewsFeedAroundResponse> {
  const limit = params.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = getMockNewsFeedSource('watchlist')
    if (!params.cursor) {
      return {
        items: [],
        newerCursor: null,
        hasNewer: false,
        olderCursor: null,
        hasOlder: false,
      }
    }
    return mockNewsFeedOlderSlice(all, params.cursor, limit)
  }

  return fetchNewsFeedAnchored(
    `${NEWS_FEED_ANCHORED_PATH}/older`,
    params,
    '관심종목 뉴스를 더 불러오지 못했습니다.',
  )
}
