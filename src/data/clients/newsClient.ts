import { isMockDataSource } from '../../config/dataSource'
import { mapNewsFeedItems } from '../mappers/stockMapper'
import { mockNewsFeed } from '../mocks/news.mock'
import { mockStockDetails } from '../mocks/stock.mock'
import type { ApiEnvelope } from '../types/api'
import type { NewsFeedItem } from '../types/news'
import type { NewsFeedCursorResponse, NewsFeedItemResponse } from '../types/stockApi'
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
const DEFAULT_NEWS_CURSOR_LIMIT = 20

export interface FetchAllNewsFeedCursorParams {
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

function buildMockNewsCursor(
  allItems: NewsFeedItemResponse[],
  offset: number,
): string | null {
  if (offset >= allItems.length) return null
  const anchor = allItems[offset]
  return `${anchor.publishedAt}|${anchor.id}`
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
