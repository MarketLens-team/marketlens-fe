import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthPanel, { type AuthMode } from '../components/auth/AuthPanel'
import { completeRegistration } from '../data/clients/completeRegistration'
import { loginWithCredentials } from '../data/clients/authClient'
import { isMockDataSource } from '../config/dataSource'
import { useAuthStore } from '../store/authStore'
import { useWatchlistStore } from '../store/watchlistStore'

function resolveRole(email: string): 'USER' | 'ADMIN' {
  if (isMockDataSource() && email.includes('admin')) {
    return 'ADMIN'
  }
  return 'USER'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const role = useAuthStore((state) => state.role)
  const addToWatchlist = useWatchlistStore((state) => state.add)
  const [mode, setMode] = useState<AuthMode>('login')

  if (isLoggedIn) {
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/'} replace />
  }

  const handleLogin = async (email: string, password: string) => {
    const tokens = await loginWithCredentials({ email, password })
    const resolvedRole = resolveRole(email)
    login(tokens.accessToken, resolvedRole)
    navigate(resolvedRole === 'ADMIN' ? '/admin' : '/')
  }

  const handleCompleteRegistration = async (input: Parameters<typeof completeRegistration>[0]) => {
    const tokens = await completeRegistration(input)
    login(tokens.accessToken, 'USER')
    input.watchlist.forEach((item) => addToWatchlist(item))
    navigate('/')
  }

  return (
    <AuthPanel
      mode={mode}
      onModeChange={setMode}
      onLogin={handleLogin}
      onCompleteRegistration={handleCompleteRegistration}
    />
  )
}
