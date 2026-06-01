import { Outlet, useLocation } from 'react-router-dom'
import { AuthLoginModal } from '../auth/AuthLoginModal'
import { useAuthModalStore } from '../../store/authModalStore'
import { AuthSessionGate } from './AuthSessionGate'
import { TickerBar } from './TickerBar'
import styles from './RootLayout.module.css'

const TICKER_HIDDEN_PATHS = new Set(['/login', '/onboarding'])

function shouldShowTicker(pathname: string): boolean {
  return !TICKER_HIDDEN_PATHS.has(pathname)
}

export function RootLayout() {
  const { pathname } = useLocation()
  const isOpen = useAuthModalStore((s) => s.isOpen)
  const close = useAuthModalStore((s) => s.close)
  const showTicker = shouldShowTicker(pathname)

  return (
    <>
      <AuthSessionGate />
      <div className={styles.shell}>
        {showTicker ? (
          <div className={styles.tickerSlot}>
            <TickerBar />
          </div>
        ) : null}
        <div className={styles.appArea}>
          <Outlet />
        </div>
      </div>
      <AuthLoginModal isOpen={isOpen} onClose={close} />
    </>
  )
}
