import { reissueTokens } from './reissueTokens'
import type { TokenResponse } from '../data/types/auth'
import { useAuthStore } from '../store/authStore'

let refreshInFlight: Promise<TokenResponse> | null = null

/** 만료까지 이 시간(초) 이하이면 선제 재발급 */
const PROACTIVE_REFRESH_THRESHOLD_S = 60

function hasAccessToken(): boolean {
  return Boolean(useAuthStore.getState().token?.trim())
}

/**
 * JWT payload의 exp 클레임(Unix 초)을 파싱.
 * 파싱 실패 시 null 반환.
 */
function getTokenExp(token: string): number | null {
  try {
    const payloadB64 = token.split('.')[1]
    if (!payloadB64) return null
    const payload = JSON.parse(atob(payloadB64)) as unknown
    if (typeof payload !== 'object' || payload === null) return null
    const exp = (payload as Record<string, unknown>).exp
    return typeof exp === 'number' ? exp : null
  } catch {
    return null
  }
}

/**
 * 토큰이 없거나, exp 파싱 불가, 또는 PROACTIVE_REFRESH_THRESHOLD_S 이내로
 * 만료 예정이면 true를 반환합니다 (→ 선제 재발급 트리거).
 */
function isTokenNearExpiry(): boolean {
  const token = useAuthStore.getState().token?.trim()
  if (!token) return true
  const exp = getTokenExp(token)
  if (exp === null) return true
  return exp - Date.now() / 1000 < PROACTIVE_REFRESH_THRESHOLD_S
}

/**
 * access token이 없거나 만료 임박 시 선제 reissue.
 * refresh token이 없으면 현재 access token 보유 여부만 반환.
 */
export async function ensureAccessToken(): Promise<boolean> {
  if (!useAuthStore.getState().refreshToken) {
    return hasAccessToken()
  }
  if (!isTokenNearExpiry()) {
    return true
  }
  try {
    await refreshSession()
    return true
  } catch {
    return false
  }
}

export function refreshSession(): Promise<TokenResponse> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) {
    return Promise.reject(new Error('저장된 refresh token이 없습니다.'))
  }

  if (!refreshInFlight) {
    refreshInFlight = reissueTokens(refreshToken)
      .then((tokens) => {
        useAuthStore.getState().setTokens(tokens)
        return tokens
      })
      .finally(() => {
        refreshInFlight = null
      })
  }

  return refreshInFlight
}
