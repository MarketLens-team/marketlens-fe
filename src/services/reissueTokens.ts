import axios from 'axios'
import { isMockDataSource } from '../config/dataSource'
import type { ApiEnvelope } from '../data/types/api'
import type { ReissueRequest, TokenResponse } from '../data/types/auth'
import { getApiErrorMessage } from '../data/util/apiError'
import { unwrapApiEnvelope } from '../data/util/apiEnvelope'
import { mockDelay } from '../data/util/mockDelay'

function resolveApiBaseUrl(): string | undefined {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (import.meta.env.DEV) return undefined
  return configured || undefined
}

/** 인터셉터 없는 클라이언트 — refresh/reissue 시 순환 참조 방지 */
const bareAuthApi = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
})

export async function reissueTokens(refreshToken: string): Promise<TokenResponse> {
  const payload: ReissueRequest = { refreshToken }
  if (isMockDataSource()) {
    await mockDelay(160)
    return {
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    }
  }
  try {
    const { data } = await bareAuthApi.post<ApiEnvelope<TokenResponse>>('/api/auth/reissue', payload)
    return unwrapApiEnvelope(data, '토큰 재발급에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '토큰 재발급에 실패했습니다.'))
  }
}
