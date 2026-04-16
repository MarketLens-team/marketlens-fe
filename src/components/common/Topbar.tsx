import { NavLink } from 'react-router-dom'
import { TopNavActions } from './TopNavActions'
import styles from './Topbar.module.css'

const TOP_MENUS = [
  { label: '섹터', to: '/sector' },
  { label: '종목', to: '/stock/005930' },
  { label: '인물', to: '/person' },
  { label: '뉴스', to: '/buzz' },
] as const

export function Topbar() {
  return (
    <header className={styles.topbar} aria-label="상단 바">
      <div className={styles.left}>
        <NavLink to="/" className={styles.brandWrap}>
          <span className={styles.brandLogo} aria-hidden>
            M
          </span>
          <span className={styles.brand}>MarketLens</span>
        </NavLink>
        <nav className={styles.menu} aria-label="상단 메뉴">
          {TOP_MENUS.map((menu) => (
            <NavLink key={menu.to} to={menu.to} className={styles.menuItem}>
              {menu.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <TopNavActions />
    </header>
  )
}
