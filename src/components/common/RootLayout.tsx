import { Outlet } from 'react-router-dom'
import { AuthLoginModal } from '../auth/AuthLoginModal'
import { useAuthModalStore } from '../../store/authModalStore'
import { AuthSessionGate } from './AuthSessionGate'

export function RootLayout() {
  const isOpen = useAuthModalStore((s) => s.isOpen)
  const close = useAuthModalStore((s) => s.close)

  return (
    <>
      <AuthSessionGate />
      <Outlet />
      <AuthLoginModal isOpen={isOpen} onClose={close} />
    </>
  )
}
