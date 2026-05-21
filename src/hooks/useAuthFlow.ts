import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isMockDataSource } from '../config/dataSource'
import { loginWithCredentials } from '../data/clients/authClient'
import { completeRegistration } from '../data/clients/completeRegistration'
import type { CompleteRegistrationInput } from '../data/clients/completeRegistration'
import { useAuthStore } from '../store/authStore'
import { useWatchlistStore } from '../store/watchlistStore'

function resolveRole(email: string): 'USER' | 'ADMIN' {
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

export function useAuthFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const addToWatchlist = useWatchlistStore((state) => state.add)

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const tokens = await loginWithCredentials({ email, password })
      const resolvedRole = resolveRole(email)
      login(tokens.accessToken, resolvedRole)
      const from = readRedirectFrom(location.state)
      if (from) {
        navigate(from, { replace: true })
        return
      }
      navigate(resolvedRole === 'ADMIN' ? '/admin' : '/', { replace: true, state: undefined })
    },
    [location.state, login, navigate],
  )

  const handleCompleteRegistration = useCallback(
    async (input: CompleteRegistrationInput) => {
      const tokens = await completeRegistration(input)
      login(tokens.accessToken, 'USER')
      input.watchlist.forEach((item) => addToWatchlist(item))
      navigate('/', { replace: true, state: undefined })
    },
    [addToWatchlist, login, navigate],
  )

  return { handleLogin, handleCompleteRegistration }
}
