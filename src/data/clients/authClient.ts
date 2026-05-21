import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type {
  AvailabilityResponse,
  CompleteSignupRequest,
  EmailVerificationConfirmRequest,
  EmailVerificationSendRequest,
  LoginRequest,
  PendingSignupRequest,
  PendingSignupResponse,
  SignupRequest,
  TokenResponse,
} from '../types/auth'
import type { ApiEnvelope } from '../types/api'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const MOCK_PENDING_TOKEN = 'mock-pending-signup-token'

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

export async function checkNicknameAvailability(nickname: string): Promise<boolean> {
  if (isMockDataSource()) {
    await mockDelay(120)
    return nickname.trim().toLowerCase() !== 'admin'
  }
  try {
    const { data } = await api.get<ApiEnvelope<AvailabilityResponse>>('/api/auth/check-nickname', {
      params: { nickname },
    })
    const result = unwrapApiEnvelope(data, '닉네임 확인에 실패했습니다.')
    return result.available
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '닉네임 확인에 실패했습니다.'))
  }
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  if (isMockDataSource()) {
    await mockDelay(120)
    return !email.trim().toLowerCase().includes('taken')
  }
  try {
    const { data } = await api.get<ApiEnvelope<AvailabilityResponse>>('/api/auth/check-email', {
      params: { email },
    })
    const result = unwrapApiEnvelope(data, '이메일 확인에 실패했습니다.')
    return result.available
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '이메일 확인에 실패했습니다.'))
  }
}

export async function sendSignupEmailVerification(email: string): Promise<void> {
  const payload: EmailVerificationSendRequest = { email, purpose: 'SIGNUP' }
  if (isMockDataSource()) {
    await mockDelay(280)
    return
  }
  try {
    const { data } = await api.post<ApiEnvelope<unknown>>('/api/auth/email-verifications', payload)
    unwrapApiEnvelope(data, '인증 메일 발송에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '인증 메일 발송에 실패했습니다.'))
  }
}

export async function confirmSignupEmailVerification(
  payload: Omit<EmailVerificationConfirmRequest, 'purpose'>,
): Promise<void> {
  const body: EmailVerificationConfirmRequest = { ...payload, purpose: 'SIGNUP' }
  if (isMockDataSource()) {
    await mockDelay(200)
    if (body.code !== '000000') {
      throw new Error('이메일 인증 코드가 올바르지 않습니다.')
    }
    return
  }
  try {
    const { data } = await api.post<ApiEnvelope<unknown>>('/api/auth/email-verifications/confirm', body)
    unwrapApiEnvelope(data, '이메일 인증에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '이메일 인증에 실패했습니다.'))
  }
}

export async function createPendingSignup(payload: PendingSignupRequest): Promise<PendingSignupResponse> {
  if (isMockDataSource()) {
    await mockDelay(200)
    return { pendingSignupToken: MOCK_PENDING_TOKEN }
  }
  try {
    const { data } = await api.post<ApiEnvelope<PendingSignupResponse>>('/api/auth/signup/pending', payload)
    return unwrapApiEnvelope(data, '회원가입 준비에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '회원가입 준비에 실패했습니다.'))
  }
}

export async function completeSignup(payload: CompleteSignupRequest): Promise<TokenResponse> {
  if (isMockDataSource()) {
    await mockDelay(240)
    return {
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    }
  }
  try {
    const { data } = await api.post<ApiEnvelope<TokenResponse>>('/api/auth/signup/complete', payload)
    return unwrapApiEnvelope(data, '회원가입 완료에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '회원가입 완료에 실패했습니다.'))
  }
}
