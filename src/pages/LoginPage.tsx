import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthPanel, { type AuthMode } from '../components/auth/AuthPanel'
import { loginWithCredentials, signupWithCredentials } from '../data/clients/authClient'
import { isMockDataSource } from '../config/dataSource'
import { useAuthStore } from '../store/authStore'

function resolveRole(email: string): 'USER' | 'ADMIN' {
  if (isMockDataSource() && email.includes('admin')) {
    return 'ADMIN'
  }
  return 'USER'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [mode, setMode] = useState<AuthMode>('login')

  const handleLogin = async (email: string, password: string) => {
    const tokens = await loginWithCredentials({ email, password })
    const role = resolveRole(email)
    login(tokens.accessToken, role)
    navigate(role === 'ADMIN' ? '/admin' : '/')
  }

  const handleSignup = async (email: string, password: string, nickname: string) => {
    await signupWithCredentials({ email, password, nickname })
  }

  return <AuthPanel mode={mode} onModeChange={setMode} onLogin={handleLogin} onSignup={handleSignup} />
}
