import { NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import styles from './Sidebar.module.css'

const MOCK_USER = {
  initials: 'MK',
  name: '김마켓',
  role: '리서치 애널리스트',
} as const

const navGroups = [
  {
    title: 'OVERVIEW',
    items: [{ label: '대시보드', to: '/', end: true }],
  },
  {
    title: 'ANALYSIS',
    items: [
      {
        label: '종목 검색',
        to: '/stock/005930',
        end: true,
        matchStockDetail: true,
      },
      { label: '관심 목록', to: '/watchlist', end: true },
      { label: '인물 발언', to: '/person', end: true },
    ],
  },
  {
    title: 'ALERTS',
    items: [{ label: '버즈 알림', to: '/buzz', end: true }],
  },
  {
    title: 'ADMIN',
    items: [
      { label: '관리자', to: '/admin', end: true },
      { label: '종목 관리', to: '/admin/stocks', end: true },
      { label: '크롤 로그', to: '/admin/crawling', end: true },
    ],
  },
] as const

function isNavActive(
  pathname: string,
  item: (typeof navGroups)[number]['items'][number],
) {
  if ('matchStockDetail' in item && item.matchStockDetail) {
    return /^\/stock\/.+/.test(pathname)
  }
  if (item.end) {
    return pathname === item.to
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>MKT/LENS</div>
        <div className={styles.logoSub}>SENTIMENT ENGINE</div>
      </div>

      <nav className={styles.nav} aria-label="주 메뉴">
        {navGroups.map((group) => (
          <div key={group.title} className={styles.group}>
            <div className={styles.groupLabel}>{group.title}</div>
            {group.items.map((item) => {
              const active = isNavActive(pathname, item)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={clsx(styles.link, active && styles.linkActive)}
                >
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className={styles.userBlock}>
        <div className={styles.avatar} aria-hidden>
          {MOCK_USER.initials}
        </div>
        <div className={styles.userText}>
          <div className={styles.userName}>{MOCK_USER.name}</div>
          <div className={styles.userRole}>{MOCK_USER.role}</div>
        </div>
      </div>
    </div>
  )
}
