import { NavLink } from 'react-router-dom'
import { TopNavActions } from './TopNavActions'
import { TopNavMenu } from './TopNavMenu'
import styles from './Topbar.module.css'

export function Topbar() {
  return (
    <header className={styles.topbar} aria-label="상단 바">
      <div className={styles.left}>
        <NavLink to="/" className={styles.brandWrap} aria-label="MarketLens 홈">
          <span className={styles.brandLogo} aria-hidden>
            M
          </span>
          <span className={styles.brand}>MarketLens</span>
        </NavLink>
        <TopNavMenu />
      </div>
      <TopNavActions />
    </header>
  )
}
