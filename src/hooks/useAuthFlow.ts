import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isMockDataSource } from '../config/dataSource'
import { loginWithCredentials, logoutSession } from '../data/clients/authClient'
import { completeRegistration } from '../data/clients/completeRegistration'
import type { CompleteRegistrationInput } from '../data/clients/completeRegistration'
import { useAuthModalStore } from '../store/authModalStore'
import { useAuthStore, type UserRole } from '../store/authStore'
import {
  clearAuthRedirect,
  consumeAuthRedirect,
  isRedirectablePath,
  pathRequiresAuth,
} from '../services/authRedirect'

function resolveRole(email: string): UserRole {
  if (isMockDataSource() && email.includes('admin')) {
    return 'ADMIN'
  }
  return 'USER'
}

function readRedirectFrom(locationState: unknown): string | undefined {
  const stored = consumeAuthRedirect()
  if (stored) return stored

  if (typeof locationState !== 'object' || locationState === null || !('from' in locationState)) {
    return undefined
  }
  const from = (locationState as { from?: unknown }).from
  if (typeof from !== 'string' || from.length === 0) return undefined
  return isRedirectablePath(from) ? from : undefined
}

function resolvePostLoginRedirect(
  from: string | undefined,
  currentPath: string,
  currentSearch: string,
  role: UserRole,
): string {
  if (from && isRedirectablePath(from)) return from
  const current = `${currentPath}${currentSearch}`
  if (isRedirectablePath(current)) return current
  return role === 'ADMIN' ? '/admin' : '/'
}

export function useAuthFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const tokens = await loginWithCredentials({ email, password })
      const resolvedRole = resolveRole(email)
      login(tokens.accessToken, tokens.refreshToken, resolvedRole)

      const redirectTo = resolvePostLoginRedirect(
        readRedirectFrom(location.state),
        location.pathname,
        location.search,
        resolvedRole,
      )
      clearAuthRedirect()
      useAuthModalStore.getState().close()
      navigate(redirectTo, { replace: true, state: undefined })
    },
    [location.pathname, location.search, location.state, login, navigate],
  )

  const handleLogout = useCallback(() => {
    void logoutSession().finally(() => {
      logout()
      useAuthModalStore.getState().close()

      // 로그인 필요 페이지는 홈으로. 공개 페이지는 유지하며 useAsyncData가 토큰 변경으로 재요청.
      if (pathRequiresAuth(location.pathname)) {
        navigate('/', { replace: true, state: undefined })
      }
    })
  }, [location.pathname, logout, navigate])

  const handleCompleteRegistration = useCallback(
    async (input: CompleteRegistrationInput) => {
      const tokens = await completeRegistration(input)
      login(tokens.accessToken, tokens.refreshToken, 'USER')
      clearAuthRedirect()
      useAuthModalStore.getState().close()
      navigate('/', { replace: true, state: undefined })
    },
    [login, navigate],
  )

  return { handleLogin, handleLogout, handleCompleteRegistration }
}
