import { isMockDataSource } from '../../config/dataSource'
import { fetchStockBuzzSurge } from './stockClient'
import { mapBuzzSurgePage } from '../mappers/buzzSurgeMapper'
import { mockBuzzSurgeResponse } from '../mocks/buzzSurge.mock'
import type { BuzzSurgePage } from '../types/buzzSurge'
import { mockDelay } from '../util/mockDelay'

const DEFAULT_LIMIT = 10

export async function fetchBuzzSurge(limit = DEFAULT_LIMIT): Promise<BuzzSurgePage> {
  if (isMockDataSource()) {
    await mockDelay(140)
    const response = structuredClone(mockBuzzSurgeResponse)
    response.items = response.items.slice(0, limit)
    return mapBuzzSurgePage(response)
  }

  const payload = await fetchStockBuzzSurge(limit)
  return mapBuzzSurgePage(payload)
}
