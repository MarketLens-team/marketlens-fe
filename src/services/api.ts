import axios from 'axios'
import { AUTH_TOKEN_KEY } from '../constants/storage'
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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = typeof error.config?.url === 'string' ? error.config.url : ''
    const isAuthEndpoint = requestUrl.includes('/api/auth/')
    if (status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout()
      window.location.assign('/')
    }
    return Promise.reject(error)
  },
)
