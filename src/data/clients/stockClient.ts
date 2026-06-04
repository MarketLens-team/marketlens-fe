import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import {
  mapNewsFeedItems,
  enrichRelatedStocksWithPrices,
  mapDirectoryToStockMarketRows,
  mapRelatedStocks,
  mapStockDetailPage,
  mapStockOverviewResponse,
  mapStockPeopleTimeline,
  mapStockRankingsResponse,
  mapStockSummaryBatchItems,
  mapStockTodayNewsResponse,
} from '../mappers/stockMapper'
import { personStatementRelatesToStock } from '../../lib/personStatementStockMatch'
import { mockPersonStatementsResponse } from '../mocks/person.mock'
import type { PersonStatementResponse } from '../types/personApi'
import { fetchUnifiedSearch } from './searchClient'
import { mockStockDirectory } from '../mocks/stockDirectory.mock'
import { mockDefaultStockCode, mockStockDetails } from '../mocks/stock.mock'
import type { ApiEnvelope } from '../types/api'
import { appendNewsCursorParam } from '../../lib/encodeNewsCursor'
import type {
  NewsFeedAroundResponse,
  NewsFeedCursorResponse,
  NewsFeedItemResponse,
  NewsFeedResponse,
  RelatedStocksResponse,
  StockBuzzSurgeResponse,
  StockDetailResponse,
  StockDirectoryResponse,
  StockOverviewResponse,
  StockPricesResponse,
  StockRankingsResponse,
  StockTodayNewsResponse,
  StockSentimentBreakdownResponse,
  StockSentimentTrendResponse,
  StockSummaryBatchItemApiResponse,
  StockSummaryBatchItemResponse,
  StockSummaryResponse,
} from '../types/stockApi'
import type { StockDirectory } from '../types/stockDirectory'
import type {
  StockDetail,
  StockMarketRow,
  StockOverview,
  StockRankings,
  StockTodayNews,
  StockSearchItem,
  TickerStockRow,
} from '../types/stock'
import { TICKER_STOCK_CODES } from '../constants/tickerStockCodes'
import { mapStockPricesToTickerRows } from '../mappers/stockMapper'
import {
  buildMockStockOverview,
  buildMockStockRankings,
} from '../mocks/stockOverview.mock'
import { buildMockStockTodayNews } from '../mocks/stockTodayNews.mock'
import { buildMockStockPricesForDirectory, buildMockStockPricesResponse } from '../mocks/stockPrices.mock'
import { mockWatchlistSummariesBatch } from '../mocks/stockSummariesBatch.mock'
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

export interface FetchStockNewsFeedAnchoredParams {
  limit?: number
  cursor?: string
  sentiment?: string
}

const DEFAULT_NEWS_CURSOR_LIMIT = 20

/** OpenAPI `getRelatedPersonStatements` — `GET /api/v1/stocks/{code}/related-person-statements` */
const STOCK_RELATED_PERSON_STATEMENTS_LIMIT = 5

export async function fetchStockRelatedPersonStatements(
  stockCode: string,
  limit = STOCK_RELATED_PERSON_STATEMENTS_LIMIT,
): Promise<PersonStatementResponse[]> {
  const code = stockCode.trim()
  if (!code) return []

  if (isMockDataSource()) {
    await mockDelay(40)
    return mockPersonStatementsResponse
      .filter((row) => personStatementRelatesToStock(row, code))
      .slice(0, limit)
  }

  const rows = await getApiData<PersonStatementResponse[]>(
    stockPath(code, '/related-person-statements'),
    '관련 인물 발언을 불러오지 못했습니다.',
    { limit },
  )
  return rows ?? []
}

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

/** Mock anchored 피드 — `o:{index}` 커서 */
function mockAnchoredIndexCursor(index: number): string {
  return `o:${index}`
}

function parseMockAnchoredIndexCursor(cursor: string | undefined): number {
  if (!cursor) return 0
  const m = /^o:(\d+)$/.exec(cursor)
  return m ? Number(m[1]) : 0
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
  const hasNewer = start > 0
  const hasOlder = end < all.length
  return {
    items: all.slice(start, end),
    newerCursor: hasNewer ? mockAnchoredIndexCursor(start) : null,
    hasNewer,
    olderCursor: hasOlder ? mockAnchoredIndexCursor(end) : null,
    hasOlder,
  }
}

function mockNewsFeedNewerSlice(
  all: NewsFeedItemResponse[],
  cursor: string,
  limit: number,
): NewsFeedAroundResponse {
  const end = parseMockAnchoredIndexCursor(cursor)
  const start = Math.max(0, end - limit)
  const hasNewer = start > 0
  return {
    items: all.slice(start, end),
    newerCursor: hasNewer ? mockAnchoredIndexCursor(start) : null,
    hasNewer,
    olderCursor: mockAnchoredIndexCursor(end),
    hasOlder: end < all.length,
  }
}

function mockNewsFeedOlderSlice(
  all: NewsFeedItemResponse[],
  cursor: string,
  limit: number,
): NewsFeedAroundResponse {
  const start = parseMockAnchoredIndexCursor(cursor)
  const end = Math.min(all.length, start + limit)
  const hasOlder = end < all.length
  return {
    items: all.slice(start, end),
    newerCursor: mockAnchoredIndexCursor(start),
    hasNewer: start > 0,
    olderCursor: hasOlder ? mockAnchoredIndexCursor(end) : null,
    hasOlder,
  }
}

function getMockStockNewsFeedAll(stockCode: string): NewsFeedItemResponse[] {
  const detail = mockStockDetails[stockCode] ?? mockStockDetails[mockDefaultStockCode]
  return mapNewsFeedItemResponseFromStockNews(detail.recentNews)
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

function buildStockNewsAnchoredQuery(
  params?: FetchStockNewsFeedAnchoredParams,
): URLSearchParams {
  const searchParams = new URLSearchParams()
  const limit = params?.limit ?? DEFAULT_NEWS_CURSOR_LIMIT
  searchParams.set('limit', String(limit))
  if (params?.sentiment) searchParams.set('sentiment', params.sentiment)
  if (params?.cursor) appendNewsCursorParam(searchParams, params.cursor)
  return searchParams
}

/** OpenAPI `GET /api/v1/news/feed/{ticker}/around/{newsId}` */
export async function fetchStockNewsFeedAround(
  stockCode: string,
  newsId: string,
  params?: Omit<FetchStockNewsFeedAnchoredParams, 'cursor'>,
): Promise<NewsFeedAroundResponse> {
  const code = stockCode.trim()
  const limit = params?.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  if (isMockDataSource()) {
    await mockDelay(100)
    const all = getMockStockNewsFeedAll(code)
    const targetId = Number(newsId)
    const anchorIndex = all.findIndex((item) => item.id === targetId)
    return mockNewsFeedAroundSlice(all, anchorIndex, limit)
  }

  const query = buildStockNewsAnchoredQuery(params).toString()
  const path = `${newsFeedPath(code)}/around/${encodeURIComponent(newsId)}${query ? `?${query}` : ''}`

  try {
    const { data } = await api.get<ApiEnvelope<NewsFeedAroundResponse>>(path)
    return unwrapApiEnvelope(data, '종목 뉴스를 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '종목 뉴스를 불러오지 못했습니다.'))
  }
}

/** OpenAPI `GET /api/v1/news/feed/{ticker}/newer` */
export async function fetchStockNewsFeedNewer(
  stockCode: string,
  params: FetchStockNewsFeedAnchoredParams,
): Promise<NewsFeedAroundResponse> {
  const code = stockCode.trim()
  const limit = params.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = getMockStockNewsFeedAll(code)
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

  const query = buildStockNewsAnchoredQuery(params).toString()
  const path = `${newsFeedPath(code)}/newer${query ? `?${query}` : ''}`

  try {
    const { data } = await api.get<ApiEnvelope<NewsFeedAroundResponse>>(path)
    return unwrapApiEnvelope(data, '종목 뉴스를 더 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '종목 뉴스를 더 불러오지 못했습니다.'))
  }
}

/** OpenAPI `GET /api/v1/news/feed/{ticker}/older` */
export async function fetchStockNewsFeedOlder(
  stockCode: string,
  params: FetchStockNewsFeedAnchoredParams,
): Promise<NewsFeedAroundResponse> {
  const code = stockCode.trim()
  const limit = params.limit ?? DEFAULT_NEWS_CURSOR_LIMIT

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = getMockStockNewsFeedAll(code)
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

  const query = buildStockNewsAnchoredQuery(params).toString()
  const path = `${newsFeedPath(code)}/older${query ? `?${query}` : ''}`

  try {
    const { data } = await api.get<ApiEnvelope<NewsFeedAroundResponse>>(path)
    return unwrapApiEnvelope(data, '종목 뉴스를 더 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '종목 뉴스를 더 불러오지 못했습니다.'))
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

/** OpenAPI `GET /api/v1/stocks/summaries/batch` — JWT 관심종목 메트릭 (aiSummary 제외) */
export async function fetchWatchlistSummariesBatch(): Promise<StockSummaryBatchItemResponse[]> {
  if (isMockDataSource()) {
    await mockDelay(80)
    return structuredClone(mockWatchlistSummariesBatch)
  }
  const raw = await getApiData<StockSummaryBatchItemApiResponse[]>(
    `${STOCKS_BASE}/summaries/batch`,
    '관심종목 지표를 불러오지 못했습니다.',
  )
  return mapStockSummaryBatchItems(raw)
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
    if (hit.relatedStocks.length > 0) {
      const priceRows = await fetchStockPrices(hit.relatedStocks.map((stock) => stock.code))
      hit.relatedStocks = enrichRelatedStocksWithPrices(hit.relatedStocks, priceRows)
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
    fetchStockRelatedPersonStatements(code),
  ])

  const relatedStocks = mapRelatedStocks(related, code)
  const relatedWithPrices =
    relatedStocks.length > 0
      ? enrichRelatedStocksWithPrices(
          relatedStocks,
          await fetchStockPrices(relatedStocks.map((stock) => stock.code)),
        )
      : relatedStocks

  return mapStockDetailPage(
    detail,
    summary,
    trend,
    breakdown,
    newsFeed.items,
    { nextCursor: newsFeed.nextCursor, hasNext: newsFeed.hasNext },
    {
      relatedStocks: relatedWithPrices,
      peopleTimeline: mapStockPeopleTimeline(mentions, code, STOCK_RELATED_PERSON_STATEMENTS_LIMIT),
    },
  )
}

/** OpenAPI `GET /api/v1/stocks/overview` */
export async function fetchStockOverview(): Promise<StockOverview> {
  if (isMockDataSource()) {
    await mockDelay(140)
    return buildMockStockOverview()
  }
  const data = await getApiData<StockOverviewResponse>(
    `${STOCKS_BASE}/overview`,
    '종목 overview를 불러오지 못했습니다.',
  )
  return mapStockOverviewResponse(data)
}

/** OpenAPI `GET /api/v1/stocks/today-news` */
export async function fetchStockTodayNews(): Promise<StockTodayNews> {
  if (isMockDataSource()) {
    await mockDelay(90)
    return buildMockStockTodayNews()
  }
  const data = await getApiData<StockTodayNewsResponse>(
    `${STOCKS_BASE}/today-news`,
    '오늘 뉴스 순위를 불러오지 못했습니다.',
  )
  return mapStockTodayNewsResponse(data)
}

/** OpenAPI `GET /api/v1/stocks/rankings` */
export async function fetchStockRankings(): Promise<StockRankings> {
  if (isMockDataSource()) {
    await mockDelay(100)
    return buildMockStockRankings()
  }
  const data = await getApiData<StockRankingsResponse>(
    `${STOCKS_BASE}/rankings`,
    '종목 랭킹을 불러오지 못했습니다.',
  )
  return mapStockRankingsResponse(data)
}

/** OpenAPI `GET /api/v1/stocks/prices` + directory — 전체 종목 시세 테이블 */
export async function fetchStockMarketList(): Promise<StockMarketRow[]> {
  const directory = await fetchStockDirectory()
  if (isMockDataSource()) {
    await mockDelay(120)
    const prices = buildMockStockPricesForDirectory(directory)
    return mapDirectoryToStockMarketRows(directory, prices)
  }
  const prices = await getApiData<StockPricesResponse>(
    `${STOCKS_BASE}/prices`,
    '종목 시세를 불러오지 못했습니다.',
  )
  return mapDirectoryToStockMarketRows(directory, prices)
}

/** OpenAPI `GET /api/v1/stocks/prices` — TickerBar 30종 */
export async function fetchStockPrices(
  codes: readonly string[] = TICKER_STOCK_CODES,
): Promise<TickerStockRow[]> {
  if (isMockDataSource()) {
    await mockDelay(80)
    return mapStockPricesToTickerRows(buildMockStockPricesResponse(), codes)
  }
  const data = await getApiData<StockPricesResponse>(
    `${STOCKS_BASE}/prices`,
    '종목 시세를 불러오지 못했습니다.',
  )
  return mapStockPricesToTickerRows(data, codes)
}

/** OpenAPI `getBuzzSurge` — `GET /api/v1/stocks/buzz-surge` */
export async function fetchStockBuzzSurge(limit = 10): Promise<StockBuzzSurgeResponse> {
  return getApiData<StockBuzzSurgeResponse>(
    `${STOCKS_BASE}/buzz-surge`,
    '언급량 급등 데이터를 불러오지 못했습니다.',
    { limit },
  )
}

/** @deprecated 통합 검색의 종목 목록만 — `fetchUnifiedSearch` 사용 권장 */
export async function fetchStockSearch(query: string): Promise<StockSearchItem[]> {
  const result = await fetchUnifiedSearch(query)
  return result.stocks.map((item) => ({ code: item.code, name: item.name }))
}
