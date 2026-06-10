import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { ApiEnvelope } from '../types/api'
import type { AlertSettings, AlertSettingsResponse } from '../types/member'
import { needsTelegramNotificationSync, toAlertSettings } from '../types/member'
import type {
  MemberResponse,
  TelegramLinkTokenResponse,
} from '../types/memberApi'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const MEMBER_ME_PATH = '/api/members/me'
const SETTINGS_PATH = '/api/members/me/settings'
const TELEGRAM_LINK_TOKEN_PATH = '/api/members/me/telegram-link-token'
const TELEGRAM_LINK_PATH = '/api/members/me/telegram-link'

/** OpenAPI `GET /api/members/me` */
export async function fetchMemberProfile(): Promise<MemberResponse> {
  if (isMockDataSource()) {
    await mockDelay(100)
    const { mockMyPageData } = await import('../mocks/myPage.mock')
    const account = mockMyPageData.account!
    return {
      nickname: account.nickname,
      email: account.email,
      createdAt: account.joinedAt,
      plan: account.plan,
    }
  }
  try {
    const { data } = await api.get<ApiEnvelope<MemberResponse>>(MEMBER_ME_PATH)
    return unwrapApiEnvelope(data, '계정 정보를 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '계정 정보를 불러오지 못했습니다.'))
  }
}

export async function fetchAlertSettings(): Promise<AlertSettingsResponse> {
  if (isMockDataSource()) {
    await mockDelay(100)
    const { mockMyPageData } = await import('../mocks/myPage.mock')
    return { ...mockMyPageData.alertSettings! }
  }
  try {
    const { data } = await api.get<ApiEnvelope<AlertSettingsResponse>>(SETTINGS_PATH)
    return unwrapApiEnvelope(data, '알림 설정을 불러오지 못했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '알림 설정을 불러오지 못했습니다.'))
  }
}

export async function updateAlertSettings(settings: AlertSettings): Promise<AlertSettingsResponse> {
  if (isMockDataSource()) {
    await mockDelay(120)
    const { mockMyPageData } = await import('../mocks/myPage.mock')
    const telegramLinked = mockMyPageData.alertSettings!.telegramLinked
    const normalized = telegramLinked ? settings : { ...settings, telegramNotificationEnabled: false }
    return { ...normalized, telegramLinked }
  }
  try {
    const { data } = await api.put<ApiEnvelope<AlertSettingsResponse>>(SETTINGS_PATH, settings)
    return unwrapApiEnvelope(data, '알림 설정 저장에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '알림 설정 저장에 실패했습니다.'))
  }
}

/** 미연동 상태에서 텔레그램 알림이 켜져 있으면 서버에 끄도록 맞춤 */
export async function syncAlertSettingsIfNeeded(
  settings: AlertSettingsResponse,
): Promise<AlertSettingsResponse> {
  if (!needsTelegramNotificationSync(settings)) return settings
  return updateAlertSettings({ ...toAlertSettings(settings), telegramNotificationEnabled: false })
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

/** OpenAPI `DELETE /api/members/me/telegram-link` */
export async function unlinkTelegram(): Promise<AlertSettingsResponse> {
  if (isMockDataSource()) {
    await mockDelay(120)
    const { mockMyPageData } = await import('../mocks/myPage.mock')
    const updated: AlertSettingsResponse = {
      ...mockMyPageData.alertSettings!,
      telegramLinked: false,
      telegramNotificationEnabled: false,
    }
    mockMyPageData.alertSettings = updated
    return { ...updated }
  }
  try {
    const { data } = await api.delete<ApiEnvelope<AlertSettingsResponse>>(TELEGRAM_LINK_PATH)
    return unwrapApiEnvelope(data, '텔레그램 연동 해제에 실패했습니다.')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '텔레그램 연동 해제에 실패했습니다.'))
  }
}
