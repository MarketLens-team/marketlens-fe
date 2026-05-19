import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TickerBar } from './TickerBar'
import { Topbar } from './Topbar'
import styles from './Layout.module.css'

interface LayoutProps {
  children: ReactNode
  hideSidebar?: boolean
}

/** 좌측 Sidebar는 보존. 기본은 상단 네비만 사용(`hideSidebar` 기본 true). Admin 등에서만 `hideSidebar={false}`. */
export function Layout({ children, hideSidebar = true }: LayoutProps) {
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
        <main className={styles.main} data-scroll-root>
          {children}
        </main>
      </div>
    </div>
  )
}
