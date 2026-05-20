import { isMockDataSource } from '../../config/dataSource'
import { appendNewsCursorParam } from '../../lib/encodeNewsCursor'
import { normalizeStockCodeForMatch } from '../../lib/normalizeStockCode'
import { api } from '../../services/api'
import {
  mapPersonTopItem,
  mapPersonTrackerFromCursorResponse,
} from '../mappers/personMapper'
import { personStatementRelatesToStock } from '../mappers/stockMapper'
import { mockFrequentStockItems, mockPersonStatementsResponse, mockPersonTopResponse } from '../mocks/person.mock'
import type { ApiEnvelope } from '../types/api'
import type { PersonMentionsRange, PersonTrackerPageData } from '../types/person'
import type {
  PersonMentionCursorResponse,
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

/** OpenAPI `GET /api/v1/persons/mentions/cursor` */
export async function fetchPersonStatementsCursor(
  params?: FetchPersonMentionsCursorParams,
): Promise<PersonMentionCursorResponse> {
  const limit = params?.limit ?? PERSON_CURSOR_DEFAULT_LIMIT
  const rangeQuery = params?.range != null ? PERSON_MENTIONS_RANGE_QUERY[params.range] : undefined

  if (isMockDataSource()) {
    await mockDelay(80)
    const all = filterMockStatementsForParams(params)
    const start = mockPersonCursorStartIndex(params?.cursor)
    const slice = all.slice(start, start + limit)
    const end = start + slice.length
    return {
      items: slice,
      topPersons: mockPersonTopResponse,
      frequentStocks: mockFrequentStockItems,
      nextCursor: mockPersonCursorNext(all.length, end),
      hasNext: end < all.length,
    }
  }

  const searchParams = new URLSearchParams()
  if (params?.personId != null) searchParams.set('personId', String(params.personId))
  if (params?.stockCode) searchParams.set('stockCode', params.stockCode)
  if (rangeQuery) searchParams.set('range', rangeQuery)
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
  if (isMockDataSource()) {
    await mockDelay(140)
    const page = await fetchPersonStatementsCursor({ ...params, limit: PERSON_CURSOR_DEFAULT_LIMIT })
    return mapPersonTrackerFromCursorResponse(page)
  }

  const cursorPage = await fetchPersonStatementsCursor({ ...params, limit: PERSON_CURSOR_DEFAULT_LIMIT })
  const mapped = mapPersonTrackerFromCursorResponse(cursorPage)
  if (mapped.topPersons.length > 0) {
    return mapped
  }

  const topPersons = await fetchPersonTop().catch(() => [] as PersonTopResponse[])
  return { ...mapped, topPersons: topPersons.map(mapPersonTopItem) }
}

/** @deprecated fetchPersonTrackerPage 사용 */
export async function fetchPersonMentions(): Promise<PersonTrackerPageData['mentions']> {
  const page = await fetchPersonTrackerPage()
  return page.mentions
}
