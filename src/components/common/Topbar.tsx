import { NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { TopNavActions } from './TopNavActions'
import styles from './Topbar.module.css'

const TOP_MENUS = [
  { label: '홈', to: '/', end: true },
  { label: '종목', to: '/stock/005930', end: true, matchStockDetail: true },
  { label: '언급량 급등', to: '/buzz', end: true },
  { label: '인물 발언', to: '/person', end: true },
] as const

function isNavActive(
  pathname: string,
  item: (typeof TOP_MENUS)[number],
) {
  if ('matchStockDetail' in item && item.matchStockDetail) {
    return /^\/stock\/.+/.test(pathname)
  }
  if (item.end) {
    return pathname === item.to
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function Topbar() {
  const { pathname } = useLocation()

  return (
    <header className={styles.topbar} aria-label="상단 바">
      <div className={styles.left}>
        <NavLink to="/" className={styles.brandWrap} aria-label="MarketLens 홈">
          <span className={styles.brandLogo} aria-hidden>
            M
          </span>
          <span className={styles.brand}>MarketLens</span>
        </NavLink>
        <nav className={styles.menu} aria-label="상단 메뉴">
          {TOP_MENUS.map((menu) => {
            const active = isNavActive(pathname, menu)
            return (
              <NavLink
                key={menu.label}
                to={menu.to}
                end={menu.end}
                className={clsx(styles.menuItem, active && styles.menuItemActive)}
                aria-current={active ? 'page' : undefined}
              >
                {menu.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
      <TopNavActions />
    </header>
  )
}
