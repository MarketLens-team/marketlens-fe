import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import { mockBuzzAlerts } from '../mocks/buzz.mock'
import type { BuzzAlert } from '../types/buzz'
import { mockDelay } from '../util/mockDelay'

/** 백엔드 연동 시: `GET /api/v1/buzz/alerts` */
const ALERTS_PATH = '/api/v1/buzz/alerts'

export async function fetchBuzzAlerts(): Promise<BuzzAlert[]> {
  if (isMockDataSource()) {
    await mockDelay()
    return structuredClone(mockBuzzAlerts)
  }
  const { data } = await api.get<BuzzAlert[]>(ALERTS_PATH)
  return data
}
