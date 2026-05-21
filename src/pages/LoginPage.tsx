import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthPanel, { type AuthMode } from '../components/auth/AuthPanel'
import { useAuthFlow } from '../hooks/useAuthFlow'
import { useAuthStore } from '../store/authStore'

function readInitialMode(state: unknown): AuthMode {
  if (typeof state === 'object' && state !== null && 'mode' in state) {
    const mode = (state as { mode?: unknown }).mode
    if (mode === 'signup') return 'signup'
  }
  return 'login'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { handleLogin } = useAuthFlow()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const role = useAuthStore((state) => state.role)
  const [mode, setMode] = useState<AuthMode>(() => readInitialMode(location.state))

  if (isLoggedIn) {
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/'} replace />
  }

  return (
    <AuthPanel
      scope="account-only"
      mode={mode}
      onModeChange={setMode}
      onLogin={handleLogin}
      onCompleteRegistration={async () => undefined}
      onSignupAccountNext={(draft) => navigate('/onboarding', { state: { accountDraft: draft } })}
    />
  )
}
