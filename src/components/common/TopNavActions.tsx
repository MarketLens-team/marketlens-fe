import { useState } from 'react'
import { TopNavSearchModal } from './TopNavSearchModal'
import { TopNavSettingsMenu } from './TopNavSettingsMenu'
import { TopNavWatchlistMenu } from './TopNavWatchlistMenu'
import styles from './TopNavActions.module.css'

export function TopNavActions() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
      <div className={styles.actions}>
        <TopNavWatchlistMenu
          suppressPanel={isSettingsOpen || isSearchOpen}
          onRequestOpen={() => {
            setIsSettingsOpen(false)
          }}
        />
        <button
          type="button"
          className={styles.searchTrigger}
          onClick={() => {
            setIsSettingsOpen(false)
            setIsSearchOpen(true)
          }}
        >
          <span className={styles.searchIcon} aria-hidden>
            ⌕
          </span>
          <span className={styles.searchPlaceholder}>검색</span>
        </button>
        <TopNavSettingsMenu
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          onRequestOpen={() => {
            setIsSettingsOpen(true)
          }}
        />
      </div>
      <TopNavSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
