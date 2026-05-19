import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { LoginRequest, SignupRequest, TokenResponse } from '../types/auth'
import type { ApiEnvelope } from '../types/api'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

export async function loginWithCredentials(payload: LoginRequest): Promise<TokenResponse> {
  if (isMockDataSource()) {
    await mockDelay(200)
    return {
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    }
  }
  try {
    const { data } = await api.post<ApiEnvelope<TokenResponse>>('/api/auth/login', payload)
    return unwrapApiEnvelope(data, '로그인에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '로그인에 실패했습니다.'))
  }
}

export async function signupWithCredentials(payload: SignupRequest): Promise<void> {
  if (isMockDataSource()) {
    await mockDelay(240)
    return
  }
  try {
    const { data } = await api.post<ApiEnvelope<unknown>>('/api/auth/signup', payload)
    unwrapApiEnvelope(data, '회원가입에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '회원가입에 실패했습니다.'))
  }
}
