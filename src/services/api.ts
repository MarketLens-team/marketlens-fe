import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { AUTH_TOKEN_KEY } from '../constants/storage'
import { ensureAccessToken, refreshSession } from './authTokenRefresh'
import { handleSessionExpired, isIntentionalLogoutInProgress } from './authRedirect'
import { useAuthStore } from '../store/authStore'

/** 개발: Vite proxy로 same-origin `/api`. 프로덕션: `VITE_API_URL` 직접 호출 */
function resolveApiBaseUrl(): string | undefined {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (import.meta.env.DEV) return undefined
  return configured || undefined
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
})

function isAuthApiPath(url: string): boolean {
  return url.includes('/api/auth/')
}

function shouldAttemptTokenRefresh(error: AxiosError): boolean {
  const status = error.response?.status
  const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
  const requestUrl = typeof config?.url === 'string' ? config.url : ''
  if (status !== 401) return false
  if (!config || config._retry) return false
  if (isAuthApiPath(requestUrl)) return false
  return Boolean(useAuthStore.getState().refreshToken)
}

api.interceptors.request.use(async (config) => {
  const requestUrl = typeof config.url === 'string' ? config.url : ''
  if (!isAuthApiPath(requestUrl)) {
    await ensureAccessToken()
  }

  const token = useAuthStore.getState().token ?? localStorage.getItem(AUTH_TOKEN_KEY)
  if (token?.trim()) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (!shouldAttemptTokenRefresh(error) || !config) {
      const status = error.response?.status
      const requestUrl = typeof config?.url === 'string' ? config.url : ''
      if (status === 401 && !isAuthApiPath(requestUrl)) {
        const wasLoggedIn = useAuthStore.getState().isLoggedIn
        useAuthStore.getState().logout()
        if (wasLoggedIn && !isIntentionalLogoutInProgress()) {
          handleSessionExpired()
        }
      }
      return Promise.reject(error)
    }

    config._retry = true

    try {
      const tokens = await refreshSession()
      config.headers.Authorization = `Bearer ${tokens.accessToken}`
      return api(config)
    } catch (refreshError) {
      const wasLoggedIn = useAuthStore.getState().isLoggedIn
      useAuthStore.getState().logout()
      if (wasLoggedIn && !isIntentionalLogoutInProgress()) {
        handleSessionExpired()
      }
      return Promise.reject(refreshError)
    }
  },
)
