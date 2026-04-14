import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { DashboardOverview } from '../types/dashboard'
import { mockDashboardOverview } from '../mocks/dashboard.mock'
import { mockDelay } from '../util/mockDelay'

/** 백엔드 연동 시: `GET /api/v1/dashboard/overview` 등과 맞추면 됩니다. */
const OVERVIEW_PATH = '/api/v1/dashboard/overview'

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  if (isMockDataSource()) {
    await mockDelay()
    return structuredClone(mockDashboardOverview)
  }
  const { data } = await api.get<DashboardOverview>(OVERVIEW_PATH)
  return data
}
