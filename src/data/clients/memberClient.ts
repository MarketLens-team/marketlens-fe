import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { ApiEnvelope } from '../types/api'
import type { AlertSettings } from '../types/member'
import type {
  MemberResponse,
  PasswordChangeRequest,
  TelegramLinkTokenResponse,
} from '../types/memberApi'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const MEMBER_ME_PATH = '/api/members/me'
const SETTINGS_PATH = '/api/members/me/settings'
const PASSWORD_PATH = '/api/members/me/password'
const TELEGRAM_LINK_TOKEN_PATH = '/api/members/me/telegram-link-token'

/** OpenAPI `GET /api/members/me` */
export async function fetchMemberProfile(): Promise<MemberResponse> {
  if (isMockDataSource()) {
    await mockDelay(100)
    const { mockMyPageData } = await import('../mocks/myPage.mock')
    return {
      nickname: mockMyPageData.account.nickname,
      email: mockMyPageData.account.email,
      createdAt: mockMyPageData.account.joinedAt,
      plan: mockMyPageData.account.plan,
    }
  }
  try {
    const { data } = await api.get<ApiEnvelope<MemberResponse>>(MEMBER_ME_PATH)
    return unwrapApiEnvelope(data, '계정 정보를 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '계정 정보를 불러오지 못했습니다.'))
  }
}

export async function fetchAlertSettings(): Promise<AlertSettings> {
  if (isMockDataSource()) {
    await mockDelay(100)
    const { mockMyPageData } = await import('../mocks/myPage.mock')
    return { ...mockMyPageData.alertSettings }
  }
  try {
    const { data } = await api.get<ApiEnvelope<AlertSettings>>(SETTINGS_PATH)
    return unwrapApiEnvelope(data, '알림 설정을 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '알림 설정을 불러오지 못했습니다.'))
  }
}

export async function updateAlertSettings(settings: AlertSettings): Promise<AlertSettings> {
  if (isMockDataSource()) {
    await mockDelay(120)
    return settings
  }
  try {
    const { data } = await api.put<ApiEnvelope<AlertSettings>>(SETTINGS_PATH, settings)
    return unwrapApiEnvelope(data, '알림 설정 저장에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '알림 설정 저장에 실패했습니다.'))
  }
}

/** OpenAPI `POST /api/members/me/telegram-link-token` */
export async function issueTelegramLinkToken(): Promise<TelegramLinkTokenResponse> {
  if (isMockDataSource()) {
    await mockDelay(120)
    return { token: `mock-telegram-link-${Date.now()}` }
  }
  try {
    const { data } = await api.post<ApiEnvelope<TelegramLinkTokenResponse>>(TELEGRAM_LINK_TOKEN_PATH)
    return unwrapApiEnvelope(data, '텔레그램 연동 준비에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '텔레그램 연동 준비에 실패했습니다.'))
  }
}

/** OpenAPI `PUT /api/members/me/password` */
export async function changeMemberPassword(payload: PasswordChangeRequest): Promise<void> {
  if (isMockDataSource()) {
    await mockDelay(160)
    if (payload.currentPassword !== 'password123') {
      throw new Error('현재 비밀번호가 올바르지 않습니다.')
    }
    return
  }
  try {
    const { data } = await api.put<ApiEnvelope<unknown>>(PASSWORD_PATH, payload)
    unwrapApiEnvelope(data, '비밀번호 변경에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '비밀번호 변경에 실패했습니다.'))
  }
}
