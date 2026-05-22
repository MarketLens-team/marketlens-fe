import { isMockDataSource } from '../../config/dataSource'
import { appendNewsCursorParam } from '../../lib/encodeNewsCursor'
import { normalizeStockCodeForMatch } from '../../lib/normalizeStockCode'
import { api } from '../../services/api'
import { mapPersonMentionsCursor, mergePersonTrackerPage } from '../mappers/personMapper'
import { personStatementRelatesToStock } from '../mappers/stockMapper'
import { mockFrequentStockItems, mockPersonStatementsResponse, mockPersonTopResponse } from '../mocks/person.mock'
import type { ApiEnvelope } from '../types/api'
import type {
  PersonDetailPageData,
  PersonMentionsFeedData,
  PersonMentionsRange,
  PersonTrackerPageData,
} from '../types/person'
import type {
  PersonFrequentStockResponse,
  PersonMentionCursorResponse,
  PersonSidebarResponse,
  PersonStatementResponse,
  PersonTopResponse,
} from '../types/personApi'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const PERSONS_BASE = '/api/v1/persons'

/** 백엔드 검증: `today` | `weekly` (OpenAPI 스키마에 enum 없음) */
const PERSON_MENTIONS_RANGE_QUERY: Record<PersonMentionsRange, string> = {
  today: 'today',
  '7d': 'weekly',
}

export interface FetchPersonMentionsParams {
  personId?: number
  /** 백엔드가 허용하면 커서 쿼리에 함께 전달 */
  stockCode?: string
  range?: PersonMentionsRange
}

export interface FetchPersonMentionsCursorParams extends FetchPersonMentionsParams {
  limit?: number
  cursor?: string
}

const PERSON_CURSOR_DEFAULT_LIMIT = 50
const PERSON_BY_PERSON_CURSOR_DEFAULT_LIMIT = 20
const PERSON_CURSOR_MAX_MATCH_PAGES_STOCK = 5

async function getPersonApiData<T>(
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

function buildPersonRangeParams(params?: FetchPersonMentionsParams): Record<string, string> {
  const searchParams: Record<string, string> = {}
  if (params?.personId != null) searchParams.personId = String(params.personId)
  if (params?.stockCode) searchParams.stockCode = params.stockCode
  if (params?.range != null) searchParams.range = PERSON_MENTIONS_RANGE_QUERY[params.range]
  return searchParams
}

function buildPersonRangeOnlyParams(range?: PersonMentionsRange): Record<string, string> {
  if (range == null) return {}
  return { range: PERSON_MENTIONS_RANGE_QUERY[range] }
}

function buildPersonCursorQueryParams(
  params?: Omit<FetchPersonMentionsCursorParams, 'personId'>,
): URLSearchParams {
  const searchParams = new URLSearchParams()
  if (params?.stockCode) searchParams.set('stockCode', params.stockCode)
  if (params?.range != null) searchParams.set('range', PERSON_MENTIONS_RANGE_QUERY[params.range])
  const limit = params?.limit ?? PERSON_CURSOR_DEFAULT_LIMIT
  searchParams.set('limit', String(limit))
  if (params?.cursor) appendNewsCursorParam(searchParams, params.cursor)
  return searchParams
}

function filterMockStatementsForParams(params?: FetchPersonMentionsParams): PersonStatementResponse[] {
  let rows = mockPersonStatementsResponse
  if (params?.personId != null) {
    rows = rows.filter((r) => r.personId === params.personId)
  }
  if (params?.stockCode) {
    const t = normalizeStockCodeForMatch(params.stockCode)
    rows = rows.filter((r) => personStatementRelatesToStock(r, t))
  }
  return rows
}

/** Mock 전용 커서 `o:{startIndex}` */
function mockPersonCursorStartIndex(cursor?: string): number {
  if (!cursor) return 0
  const m = /^o:(\d+)$/.exec(cursor)
  return m ? Number(m[1]) : 0
}

function mockPersonCursorNext(allLen: number, endExclusive: number): string | null {
  if (endExclusive >= allLen) return null
  return `o:${endExclusive}`
}

/** OpenAPI `GET /api/v1/persons/mentions/cursor` — 메인 리스트 전용 */
export async function fetchPersonStatementsCursor(
  params?: FetchPersonMentionsCursorParams,
): Promise<PersonMentionCursorResponse> {
  const limit = params?.limit ?? PERSON_CURSOR_DEFAULT_LIMIT

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = filterMockStatementsForParams(params)
    const start = mockPersonCursorStartIndex(params?.cursor)
    const slice = all.slice(start, start + limit)
    const end = start + slice.length
    return {
      items: slice,
      nextCursor: mockPersonCursorNext(all.length, end),
      hasNext: end < all.length,
    }
  }

  const searchParams = new URLSearchParams(buildPersonRangeParams(params))
  searchParams.set('limit', String(limit))
  if (params?.cursor) appendNewsCursorParam(searchParams, params.cursor)

  const query = searchParams.toString()
  const path = `${PERSONS_BASE}/mentions/cursor${query ? `?${query}` : ''}`

  try {
    const { data } = await api.get<ApiEnvelope<PersonMentionCursorResponse>>(path)
    return unwrapApiEnvelope(data, '인물 발언을 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '인물 발언을 불러오지 못했습니다.'))
  }
}

/** OpenAPI `GET /api/v1/persons/{personId}/mentions/cursor` — 인물 상세 전용 */
export async function fetchPersonMentionsCursorByPersonId(
  personId: number,
  params?: Omit<FetchPersonMentionsCursorParams, 'personId'>,
): Promise<PersonMentionCursorResponse> {
  const limit = params?.limit ?? PERSON_BY_PERSON_CURSOR_DEFAULT_LIMIT

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = filterMockStatementsForParams({ ...params, personId })
    const start = mockPersonCursorStartIndex(params?.cursor)
    const slice = all.slice(start, start + limit)
    const end = start + slice.length
    return {
      items: slice,
      nextCursor: mockPersonCursorNext(all.length, end),
      hasNext: end < all.length,
    }
  }

  const searchParams = buildPersonCursorQueryParams({ ...params, limit })
  const query = searchParams.toString()
  const path = `${PERSONS_BASE}/${personId}/mentions/cursor${query ? `?${query}` : ''}`

  try {
    const { data } = await api.get<ApiEnvelope<PersonMentionCursorResponse>>(path)
    return unwrapApiEnvelope(data, '인물 발언을 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '인물 발언을 불러오지 못했습니다.'))
  }
}

export async function fetchPersonMentionsFeedPage(
  personId: number,
  params?: FetchPersonMentionsParams & { limit?: number },
): Promise<PersonMentionsFeedData> {
  const page = await fetchPersonMentionsCursorByPersonId(personId, {
    range: params?.range,
    limit: params?.limit ?? PERSON_BY_PERSON_CURSOR_DEFAULT_LIMIT,
  })
  return mapPersonMentionsCursor(page)
}

/** OpenAPI `GET /api/v1/persons/top-mentioned` — 언급량 TOP 5 인물 */
export async function fetchPersonTopMentioned(params?: FetchPersonMentionsParams): Promise<PersonTopResponse[]> {
  if (isMockDataSource()) {
    await mockDelay(50)
    return mockPersonTopResponse
  }

  return getPersonApiData<PersonTopResponse[]>(
    `${PERSONS_BASE}/top-mentioned`,
    '화제 인물을 불러오지 못했습니다.',
    buildPersonRangeParams(params),
  )
}

/** OpenAPI `GET /api/v1/persons/{personId}/frequent-stocks` — 인물별 연관 종목 */
export async function fetchPersonFrequentStocksByPersonId(
  personId: number,
  params?: FetchPersonMentionsParams,
): Promise<PersonFrequentStockResponse[]> {
  if (isMockDataSource()) {
    await mockDelay(50)
    const rows = filterMockStatementsForParams({ ...params, personId })
    const counts = new Map<string, PersonFrequentStockResponse>()
    for (const row of rows) {
      for (const stock of row.relatedStocks ?? []) {
        const code = stock.stockCode ?? stock.code ?? ''
        if (!code) continue
        const hit = counts.get(code) ?? {
          stockCode: code,
          stockName: stock.stockName ?? code,
          mentionCount: 0,
        }
        hit.mentionCount = (hit.mentionCount ?? 0) + 1
        counts.set(code, hit)
      }
    }
    const derived = [...counts.values()].sort((a, b) => (b.mentionCount ?? 0) - (a.mentionCount ?? 0))
    return derived.length ? derived : mockFrequentStockItems
  }

  return getPersonApiData<PersonFrequentStockResponse[]>(
    `${PERSONS_BASE}/${personId}/frequent-stocks`,
    '연관 종목을 불러오지 못했습니다.',
    buildPersonRangeOnlyParams(params?.range),
  )
}

/** OpenAPI `GET /api/v1/persons/sidebar` — (레거시) 전역 자주 언급 종목 등 */
export async function fetchPersonSidebar(params?: FetchPersonMentionsParams): Promise<PersonSidebarResponse> {
  if (isMockDataSource()) {
    await mockDelay(60)
    return {
      topPersons: mockPersonTopResponse,
      frequentStocks: mockFrequentStockItems,
    }
  }

  return getPersonApiData<PersonSidebarResponse>(
    `${PERSONS_BASE}/sidebar`,
    '인물 사이드바를 불러오지 못했습니다.',
    buildPersonRangeParams(params),
  )
}

/** 종목 상세 타임라인 — 커서로 연관 발언 충분히(또는 소진)까지 */
export async function fetchPersonStatementsForStockDetail(stockCode: string): Promise<PersonStatementResponse[]> {
  const code = stockCode.trim()
  if (!code) return []

  if (isMockDataSource()) {
    return filterMockStatementsForParams({ stockCode: code })
  }

  const collected: PersonStatementResponse[] = []
  let cursor: string | undefined
  for (let p = 0; p < PERSON_CURSOR_MAX_MATCH_PAGES_STOCK; p++) {
    let chunk: PersonMentionCursorResponse
    try {
      chunk = await fetchPersonStatementsCursor({ stockCode: code, limit: 40, cursor })
    } catch {
      chunk = await fetchPersonStatementsCursor({ limit: 40, cursor }).catch(() => ({
        items: [] as PersonStatementResponse[],
        hasNext: false,
        nextCursor: null,
      }))
    }
    collected.push(...chunk.items)
    const matches = collected.filter((r) => personStatementRelatesToStock(r, code)).length
    if (matches >= 8 || !chunk.hasNext || !chunk.nextCursor) break
    cursor = chunk.nextCursor ?? undefined
  }
  return collected
}

/** OpenAPI `getTopPersons` — `GET /api/v1/persons/top` */
export async function fetchPersonTop(): Promise<PersonTopResponse[]> {
  return getPersonApiData<PersonTopResponse[]>(`${PERSONS_BASE}/top`, '화제 인물을 불러오지 못했습니다.')
}

export async function fetchPersonTrackerPage(params?: FetchPersonMentionsParams): Promise<PersonTrackerPageData> {
  const cursorParams = { ...params, limit: PERSON_CURSOR_DEFAULT_LIMIT }
  const [cursorPage, topPersons, sidebar] = await Promise.all([
    fetchPersonStatementsCursor(cursorParams),
    fetchPersonTopMentioned(params),
    fetchPersonSidebar(params),
  ])
  return mergePersonTrackerPage(cursorPage, topPersons, sidebar.frequentStocks ?? [])
}

export async function fetchPersonDetailPage(
  personId: number,
  params?: FetchPersonMentionsParams & { limit?: number },
): Promise<PersonDetailPageData> {
  const [cursorPage, topPersons, frequentStocks] = await Promise.all([
    fetchPersonMentionsCursorByPersonId(personId, {
      range: params?.range,
      limit: params?.limit ?? PERSON_BY_PERSON_CURSOR_DEFAULT_LIMIT,
    }),
    fetchPersonTopMentioned(params),
    fetchPersonFrequentStocksByPersonId(personId, params),
  ])
  return mergePersonTrackerPage(cursorPage, topPersons, frequentStocks)
}

/** @deprecated fetchPersonTrackerPage 사용 */
export async function fetchPersonMentions(): Promise<PersonTrackerPageData['mentions']> {
  const page = await fetchPersonTrackerPage()
  return page.mentions
}
