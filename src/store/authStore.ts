import { create } from 'zustand'
import { AUTH_ROLE_KEY, AUTH_TOKEN_KEY } from '../constants/storage'

export type UserRole = 'USER' | 'ADMIN'

function readStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

function readStoredRole(): UserRole | null {
  const raw = localStorage.getItem(AUTH_ROLE_KEY)
  if (raw === 'USER' || raw === 'ADMIN') return raw
  return null
}

interface AuthState {
  token: string | null
  role: UserRole | null
  isLoggedIn: boolean
  login: (token: string, role: UserRole) => void
  logout: () => void
}

const initialToken = readStoredToken()
const initialRole = readStoredRole()

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  role: initialRole,
  isLoggedIn: Boolean(initialToken),
  login: (token, role) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_ROLE_KEY, role)
    set({ token, role, isLoggedIn: true })
  },
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_ROLE_KEY)
    set({ token: null, role: null, isLoggedIn: false })
  },
}))
