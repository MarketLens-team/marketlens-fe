import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mapSearchResponse } from '../mappers/searchMapper'
import { buildMockSearchResponse } from '../mocks/search.mock'
import type { ApiEnvelope } from '../types/api'
import type { SearchResponse } from '../types/searchApi'
import type { UnifiedSearchResult } from '../types/search'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const SEARCH_PATH = '/api/v1/search'

/** OpenAPI `GET /api/v1/search?q=` — 공개 조회, 종목·인물 + 관련 뉴스·발언 */
export async function fetchUnifiedSearch(query: string): Promise<UnifiedSearchResult> {
  const q = query.trim()

  if (isMockDataSource()) {
    await mockDelay(180)
    return mapSearchResponse(buildMockSearchResponse(q), q)
  }

  try {
    const { data } = await api.get<ApiEnvelope<SearchResponse>>(SEARCH_PATH, {
      params: { q },
    })
    const payload = unwrapApiEnvelope(data, '검색 결과를 불러오지 못했습니다.')
    return mapSearchResponse(payload, q)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '검색 결과를 불러오지 못했습니다.'))
  }
}
