import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TickerBar } from './TickerBar'
import { Topbar } from './Topbar'
import styles from './Layout.module.css'

interface LayoutProps {
  children: ReactNode
  hideSidebar?: boolean
}

export function Layout({ children, hideSidebar = false }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.topStrip}>
        <div className={styles.tickerSlot}>
          <TickerBar />
        </div>
        <div className={styles.topbarSlot}>
          <Topbar />
        </div>
      </div>
      <div className={styles.body}>
        {!hideSidebar ? (
          <aside className={styles.sidebar}>
            <Sidebar />
          </aside>
        ) : null}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
