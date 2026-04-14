import { useNavigate } from 'react-router-dom'
import LoginPanel from '../components/auth/LoginPanel'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const handleLogin = (email: string, password: string) => {
    if (!email || !password) return

    const role = email.includes('admin') ? 'ADMIN' : 'USER'
    login(`mock-token-${Date.now()}`, role)
    navigate(role === 'ADMIN' ? '/admin' : '/')
  }

  return <LoginPanel onSubmit={handleLogin} />
}
