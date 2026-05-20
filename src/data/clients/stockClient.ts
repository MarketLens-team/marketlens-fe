import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import {
  mapNewsFeedItems,
  mapRelatedStocks,
  mapStockDetailPage,
  mapStockPeopleTimeline,
} from '../mappers/stockMapper'
import { fetchPersonStatements } from './personClient'
import { mockStockDirectory } from '../mocks/stockDirectory.mock'
import { mockDefaultStockCode, mockStockDetails } from '../mocks/stock.mock'
import type { ApiEnvelope } from '../types/api'
import { appendNewsCursorParam } from '../../lib/encodeNewsCursor'
import type {
  NewsFeedCursorResponse,
  NewsFeedItemResponse,
  NewsFeedResponse,
  StockDetailResponse,
  StockDirectoryResponse,
  StockSentimentBreakdownResponse,
  RelatedStocksResponse,
  StockBuzzSurgeResponse,
  StockSentimentTrendResponse,
  StockSummaryResponse,
} from '../types/stockApi'
import type { StockDirectory } from '../types/stockDirectory'
import type { StockDetail, StockSearchItem } from '../types/stock'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const STOCKS_BASE = '/api/v1/stocks'

function stockPath(code: string, suffix = '') {
  return `${STOCKS_BASE}/${encodeURIComponent(code)}${suffix}`
}

function newsFeedPath(ticker: string) {
  return `/api/v1/news/feed/${encodeURIComponent(ticker)}`
}

async function getApiData<T>(
  path: string,
  fallbackMessage: string,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    const { data } = await api.get<ApiEnvelope<T>>(path, { params })
    return unwrapApiEnvelope(data, fallbackMessage)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage))
  }
}

export interface FetchStockNewsFeedParams {
  sentiment?: string
  page?: number
  size?: number
}

export interface FetchStockNewsFeedCursorParams {
  limit?: number
  cursor?: string
  sentiment?: string
}

const DEFAULT_NEWS_CURSOR_LIMIT = 20

function mapNewsFeedItemResponseFromStockNews(
  items: StockDetail['recentNews'],
): NewsFeedItemResponse[] {
  return items.map((item) => ({
    id: Number(item.id) || 0,
    title: item.title,
    description: item.description ?? '',
    originalLink: item.url ?? '',
    source: item.source,
    publishedAt: item.publishedAt,
    imageUrl: item.imageUrl ?? '',
    sentimentScore: item.sentimentScore,
    sentiment: item.sentiment,
  }))
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

/** OpenAPI `GET /api/v1/news/feed/{ticker}/cursor` — 커서는 `publishedAt|id`, 쿼리에 `%7C` 인코딩 */
export async function fetchStockNewsFeedCursor(
  stockCode: string,
  params?: FetchStockNewsFeedCursorParams,
): Promise<NewsFeedCursorResponse> {
  const code = stockCode.trim()
  const limit = params?.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  if (isMockDataSource()) {
    await mockDelay(100)
    const detail = mockStockDetails[code] ?? mockStockDetails[mockDefaultStockCode]
    const all = mapNewsFeedItemResponseFromStockNews(detail.recentNews)
    const offset = parseMockNewsCursorOffset(params?.cursor)
    const slice = all.slice(offset, offset + limit)
    const nextOffset = offset + slice.length
    const hasNext = nextOffset < all.length
    return {
      items: slice,
      nextCursor: hasNext ? buildMockNewsCursor(all, nextOffset) : null,
      hasNext,
    }
  }

  const searchParams = new URLSearchParams()
  searchParams.set('limit', String(limit))
  if (params?.sentiment) searchParams.set('sentiment', params.sentiment)
  if (params?.cursor) appendNewsCursorParam(searchParams, params.cursor)

  const query = searchParams.toString()
  const path = `${newsFeedPath(code)}/cursor${query ? `?${query}` : ''}`

  try {
    const { data } = await api.get<ApiEnvelope<NewsFeedCursorResponse>>(path)
    return unwrapApiEnvelope(data, '종목 뉴스를 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '종목 뉴스를 불러오지 못했습니다.'))
  }
}

export async function fetchStockDirectory(): Promise<StockDirectory> {
  if (isMockDataSource()) {
    await mockDelay(140)
    return structuredClone(mockStockDirectory)
  }
  const data = await getApiData<StockDirectoryResponse>(STOCKS_BASE, '종목 목록을 불러오지 못했습니다.')
  return { sectors: data.sectors }
}

export async function fetchStockNewsFeed(
  stockCode: string,
  params?: FetchStockNewsFeedParams,
): Promise<NewsFeedResponse> {
  return getApiData<NewsFeedResponse>(newsFeedPath(stockCode), '종목 뉴스를 불러오지 못했습니다.', {
    ...params,
  })
}

/** OpenAPI `GET /api/v1/stocks/{code}/summary` */
export async function fetchStockSummary(
  stockCode: string,
  recordedAt?: string,
): Promise<StockSummaryResponse> {
  const code = stockCode.trim()
  const dateQuery = recordedAt ? { recordedAt } : undefined
  return getApiData<StockSummaryResponse>(
    stockPath(code, '/summary'),
    '종목 요약을 불러오지 못했습니다.',
    dateQuery,
  )
}

export async function fetchStockDetail(stockCode: string, recordedAt?: string): Promise<StockDetail> {
  const code = stockCode.trim()
  if (!code) {
    throw new Error('stockCode is required')
  }

  if (isMockDataSource()) {
    await mockDelay(120)
    const hit = structuredClone(mockStockDetails[code] ?? mockStockDetails[mockDefaultStockCode])
    const newsFeed = await fetchStockNewsFeedCursor(code, { limit: 2 })
    hit.recentNews = mapNewsFeedItems(newsFeed.items, [hit.stock.name, hit.stock.code])
    hit.newsPagination = {
      nextCursor: newsFeed.nextCursor,
      hasNext: newsFeed.hasNext,
    }
    return hit
  }

  const dateQuery = recordedAt ? { recordedAt } : undefined

  const [detail, summary, trend, breakdown, newsFeed, related, mentions] = await Promise.all([
    getApiData<StockDetailResponse>(stockPath(code), '종목 정보를 불러오지 못했습니다.'),
    getApiData<StockSummaryResponse>(
      stockPath(code, '/summary'),
      '종목 요약을 불러오지 못했습니다.',
      dateQuery,
    ),
    getApiData<StockSentimentTrendResponse>(
      stockPath(code, '/sentiment-trend'),
      '감성 추이를 불러오지 못했습니다.',
      dateQuery,
    ),
    getApiData<StockSentimentBreakdownResponse>(
      stockPath(code, '/sentiment-breakdown'),
      '감성 분포를 불러오지 못했습니다.',
      dateQuery,
    ),
    fetchStockNewsFeedCursor(code, { limit: DEFAULT_NEWS_CURSOR_LIMIT }),
    getApiData<RelatedStocksResponse>(
      stockPath(code, '/related'),
      '연관 종목을 불러오지 못했습니다.',
    ),
    fetchPersonStatements().catch(() => []),
  ])

  return mapStockDetailPage(
    detail,
    summary,
    trend,
    breakdown,
    newsFeed.items,
    { nextCursor: newsFeed.nextCursor, hasNext: newsFeed.hasNext },
    {
      relatedStocks: mapRelatedStocks(related, code),
      peopleTimeline: mapStockPeopleTimeline(mentions, code),
    },
  )
}

/** OpenAPI `getBuzzSurge` — `GET /api/v1/stocks/buzz-surge` */
export async function fetchStockBuzzSurge(limit = 10): Promise<StockBuzzSurgeResponse> {
  return getApiData<StockBuzzSurgeResponse>(
    `${STOCKS_BASE}/buzz-surge`,
    '언급량 급등 데이터를 불러오지 못했습니다.',
    { limit },
  )
}

/** OpenAPI에 검색 엔드포인트 없음 — 목록에서 클라이언트 필터 */
export async function fetchStockSearch(query: string): Promise<StockSearchItem[]> {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const directory = isMockDataSource()
    ? mockStockDirectory
    : await fetchStockDirectory()

  return directory.sectors
    .flatMap((sector) => sector.stocks)
    .filter(
      (item) =>
        item.code.toLowerCase().includes(normalized) || item.name.toLowerCase().includes(normalized),
    )
    .slice(0, 12)
    .map((item) => ({ code: item.code, name: item.name }))
}
