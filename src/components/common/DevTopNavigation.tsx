import { useState } from 'react'
import { DevSearchModal } from './DevSearchModal'
import { DevSettingsMenu } from './DevSettingsMenu'
import { DevWatchlistPopover } from './DevWatchlistPopover'
import styles from './DevTopNavigation.module.css'

const TOP_MENUS = ['섹터', '종목', '인물', '뉴스'] as const

export function DevTopNavigation() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
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
          <DevWatchlistPopover
            suppressPanel={isSettingsOpen}
            onRequestOpen={() => {
              setIsSettingsOpen(false)
            }}
          />
          <button type="button" className={styles.searchWrap} onClick={() => setIsSearchModalOpen(true)}>
            <span className={styles.searchIcon} aria-hidden>
              ⌕
            </span>
            <span className={styles.searchPlaceholder}>검색</span>
          </button>
          <DevSettingsMenu
            isOpen={isSettingsOpen}
            onOpenChange={(nextOpen) => {
              setIsSettingsOpen(nextOpen)
            }}
            onRequestOpen={() => {
              // 설정 메뉴 오픈 시 호버 패널은 강제로 숨김 처리한다.
              setIsSettingsOpen(true)
            }}
          />
        </div>
      </header>
      <DevSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  )
}
