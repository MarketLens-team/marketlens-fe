import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isMockDataSource } from '../config/dataSource'
import { loginWithCredentials } from '../data/clients/authClient'
import { completeRegistration } from '../data/clients/completeRegistration'
import type { CompleteRegistrationInput } from '../data/clients/completeRegistration'
import { useAuthModalStore } from '../store/authModalStore'
import { useAuthStore, type UserRole } from '../store/authStore'
import { useWatchlistStore } from '../store/watchlistStore'

const AUTH_ENTRY_PATHS = new Set(['/login', '/onboarding'])
const PRIVATE_PATH_PREFIXES = ['/watchlist', '/mypage', '/admin'] as const

function resolveRole(email: string): UserRole {
  if (isMockDataSource() && email.includes('admin')) {
    return 'ADMIN'
  }
  return 'USER'
}

function readRedirectFrom(locationState: unknown): string | undefined {
  if (typeof locationState !== 'object' || locationState === null || !('from' in locationState)) {
    return undefined
  }
  const from = (locationState as { from?: unknown }).from
  return typeof from === 'string' && from.length > 0 ? from : undefined
}

function pathRequiresAuth(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

function isRedirectablePath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) return false
  const pathname = path.split('?')[0]
  return !AUTH_ENTRY_PATHS.has(pathname)
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
  const addToWatchlist = useWatchlistStore((state) => state.add)

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const tokens = await loginWithCredentials({ email, password })
      const resolvedRole = resolveRole(email)
      login(tokens.accessToken, resolvedRole)

      const redirectTo = resolvePostLoginRedirect(
        readRedirectFrom(location.state),
        location.pathname,
        location.search,
        resolvedRole,
      )
      useAuthModalStore.getState().close()
      navigate(redirectTo, { replace: true, state: undefined })
    },
    [location.pathname, location.search, location.state, login, navigate],
  )

  const handleLogout = useCallback(() => {
    logout()
    useAuthModalStore.getState().close()

    // 로그인 필요 페이지는 홈으로. 공개 페이지는 유지하며 useAsyncData가 토큰 변경으로 재요청.
    if (pathRequiresAuth(location.pathname)) {
      navigate('/', { replace: true, state: undefined })
    }
  }, [location.pathname, logout, navigate])

  const handleCompleteRegistration = useCallback(
    async (input: CompleteRegistrationInput) => {
      const tokens = await completeRegistration(input)
      login(tokens.accessToken, 'USER')
      input.watchlist.forEach((item) => addToWatchlist(item))
      useAuthModalStore.getState().close()
      navigate('/', { replace: true, state: undefined })
    },
    [addToWatchlist, login, navigate],
  )

  return { handleLogin, handleLogout, handleCompleteRegistration }
}
