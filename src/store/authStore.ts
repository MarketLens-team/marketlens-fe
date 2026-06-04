import { create } from 'zustand'
import type { TokenResponse } from '../data/types/auth'
import { AUTH_REFRESH_TOKEN_KEY, AUTH_ROLE_KEY, AUTH_TOKEN_KEY } from '../constants/storage'

export type UserRole = 'USER' | 'ADMIN'

function readStoredToken(): string | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token?.trim()) return null
  return token
}

function readStoredRefreshToken(): string | null {
  return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)
}

function readStoredRole(): UserRole | null {
  const raw = localStorage.getItem(AUTH_ROLE_KEY)
  if (raw === 'USER' || raw === 'ADMIN') return raw
  return null
}

function persistSession(accessToken: string, refreshToken: string, role: UserRole) {
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(AUTH_ROLE_KEY, role)
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  role: UserRole | null
  isLoggedIn: boolean
  login: (accessToken: string, refreshToken: string, role: UserRole) => void
  setTokens: (tokens: TokenResponse, role?: UserRole) => void
  logout: () => void
}

const initialToken = readStoredToken()
const initialRefreshToken = readStoredRefreshToken()
const initialRole = readStoredRole()

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  refreshToken: initialRefreshToken,
  role: initialRole,
  isLoggedIn: Boolean(initialToken),
  login: (accessToken, refreshToken, role) => {
    persistSession(accessToken, refreshToken, role)
    set({ token: accessToken, refreshToken, role, isLoggedIn: true })
  },
  setTokens: (tokens, role) => {
    const resolvedRole = role ?? get().role ?? 'USER'
    persistSession(tokens.accessToken, tokens.refreshToken, resolvedRole)
    set({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      role: resolvedRole,
      isLoggedIn: true,
    })
  },
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY)
    localStorage.removeItem(AUTH_ROLE_KEY)
    set({ token: null, refreshToken: null, role: null, isLoggedIn: false })
  },
}))
