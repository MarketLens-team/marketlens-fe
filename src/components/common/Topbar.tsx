import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import clsx from 'clsx'
import styles from './Topbar.module.css'

type RangeTab = '1D' | '7D' | '30D'

function pageTitleFromPath(pathname: string): string {
  if (pathname === '/') return '대시보드'
  if (/^\/stock\/.+/.test(pathname)) return '종목 상세'
  if (pathname === '/person') return '인물 발언'
  if (pathname === '/buzz') return '버즈 알림'
  if (pathname === '/admin' || pathname === '/admin/') return '관리자'
  if (pathname === '/admin/stocks') return '종목 관리'
  if (pathname === '/admin/crawling') return '크롤 로그'
  return 'MarketLens'
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const RANGE_TABS: RangeTab[] = ['1D', '7D', '30D']

export function Topbar() {
  const { pathname } = useLocation()
  const [range, setRange] = useState<RangeTab>('1D')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <header className={styles.topbar} aria-label="상단 바">
      <div className={styles.title}>{pageTitleFromPath(pathname)}</div>
      <div className={styles.right}>
        <span className={styles.live}>
          <span className={styles.liveDot} aria-hidden />
          LIVE
        </span>
        <div className={styles.tabs} role="tablist" aria-label="기간 선택">
          {RANGE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={range === tab}
              className={clsx(styles.tab, range === tab && styles.tabActive)}
              onClick={() => setRange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <time className={styles.time} dateTime={now.toISOString()}>
          {formatTime(now)}
        </time>
      </div>
    </header>
  )
}
