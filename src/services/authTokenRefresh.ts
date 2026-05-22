import { reissueTokens } from './reissueTokens'
import type { TokenResponse } from '../data/types/auth'
import { useAuthStore } from '../store/authStore'

let refreshInFlight: Promise<TokenResponse> | null = null

function hasAccessToken(): boolean {
  return Boolean(useAuthStore.getState().token?.trim())
}

/** access가 없고 refresh만 있을 때 선제 reissue (SPA 이동·API 호출 전) */
export async function ensureAccessToken(): Promise<boolean> {
  if (!useAuthStore.getState().refreshToken) {
    return hasAccessToken()
  }
  if (hasAccessToken()) {
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
