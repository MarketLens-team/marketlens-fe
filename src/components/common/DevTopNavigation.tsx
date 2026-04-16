import { DevWatchlistPopover } from './DevWatchlistPopover'
import styles from './DevTopNavigation.module.css'

const TOP_MENUS = ['섹터', '종목', '인물', '뉴스'] as const

export function DevTopNavigation() {
  return (
    <header className={styles.appTopbar}>
      <div className={styles.brandWrap}>
        <span className={styles.brandLogo} aria-hidden>
          M
        </span>
        <div className={styles.brand}>MarketLens</div>
      </div>
      <nav className={styles.homeNav} aria-label="상단 메뉴">
        {TOP_MENUS.map((menu) => (
          <button key={menu} type="button">
            {menu}
          </button>
        ))}
      </nav>
      <div className={styles.headerActions}>
        <DevWatchlistPopover />
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden>
            ⌕
          </span>
          <input className={styles.search} placeholder="검색" />
        </div>
        <button type="button" className={styles.circleButton} aria-label="설정">
          ⚙
        </button>
      </div>
    </header>
  )
}
