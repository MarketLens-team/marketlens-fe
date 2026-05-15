import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { ApiEnvelope, LoginRequest, SignupRequest, TokenResponse } from '../types/auth'
import { mockDelay } from '../util/mockDelay'

function assertSuccess<T>(envelope: ApiEnvelope<T>, fallbackMessage: string): T {
  if (envelope.success && envelope.data) {
    return envelope.data
  }
  throw new Error(envelope.error?.message ?? fallbackMessage)
}

export async function loginWithCredentials(payload: LoginRequest): Promise<TokenResponse> {
  if (isMockDataSource()) {
    await mockDelay(200)
    return {
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    }
  }
  const { data } = await api.post<ApiEnvelope<TokenResponse>>('/api/auth/login', payload)
  return assertSuccess(data, '로그인에 실패했습니다.')
}

export async function signupWithCredentials(payload: SignupRequest): Promise<void> {
  if (isMockDataSource()) {
    await mockDelay(240)
    return
  }
  const { data } = await api.post<ApiEnvelope<unknown>>('/api/auth/signup', payload)
  if (!data.success) {
    throw new Error(data.error?.message ?? '회원가입에 실패했습니다.')
  }
}
