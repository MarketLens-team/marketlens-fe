import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mapBuzzSurgePage } from '../mappers/buzzSurgeMapper'
import { mockBuzzSurgeResponse } from '../mocks/buzzSurge.mock'
import type { ApiEnvelope } from '../types/api'
import type { BuzzSurgePage } from '../types/buzzSurge'
import type { StockBuzzSurgeResponse } from '../types/stockApi'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const BUZZ_SURGE_PATH = '/api/v1/stocks/buzz-surge'
const DEFAULT_LIMIT = 10

export async function fetchBuzzSurge(limit = DEFAULT_LIMIT): Promise<BuzzSurgePage> {
  if (isMockDataSource()) {
    await mockDelay(140)
    const response = structuredClone(mockBuzzSurgeResponse)
    response.items = response.items.slice(0, limit)
    const page = mapBuzzSurgePage(response)
    return {
      ...page,
      summary: { ...page.summary, detectedCount: 23 },
    }
  }

  try {
    const { data } = await api.get<ApiEnvelope<StockBuzzSurgeResponse>>(BUZZ_SURGE_PATH, {
      params: { limit },
    })
    const payload = unwrapApiEnvelope(data, '언급량 급등 데이터를 불러오지 못했습니다.')
    return mapBuzzSurgePage(payload)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '언급량 급등 데이터를 불러오지 못했습니다.'))
  }
}
