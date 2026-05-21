import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchUnifiedSearch } from '../../data/clients/searchClient'
import type { UnifiedSearchResult } from '../../data/types/search'
import { TopNavSearchModal } from './TopNavSearchModal'
import { TopNavSettingsMenu } from './TopNavSettingsMenu'
import { TopNavWatchlistMenu } from './TopNavWatchlistMenu'
import styles from './TopNavActions.module.css'

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

type SearchSeed =
  | { kind: 'success'; results: UnifiedSearchResult }
  | { kind: 'error'; message: string }

export function TopNavActions() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchSeed, setSearchSeed] = useState<SearchSeed | null>(null)
  const [isSearchOpening, setIsSearchOpening] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const searchOpeningRef = useRef(false)

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false)
    setSearchSeed(null)
  }, [])

  const openSearch = useCallback(async () => {
    if (searchOpeningRef.current || isSearchOpen) return

    searchOpeningRef.current = true
    setIsSearchOpening(true)
    setIsSettingsOpen(false)

    try {
      const data = await fetchUnifiedSearch('')
      setSearchSeed({ kind: 'success', results: data })
      setIsSearchOpen(true)
    } catch (e) {
      setSearchSeed({
        kind: 'error',
        message: e instanceof Error ? e.message : '검색을 불러오지 못했습니다.',
      })
      setIsSearchOpen(true)
    } finally {
      searchOpeningRef.current = false
      setIsSearchOpening(false)
    }
  }, [isSearchOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (isEditableTarget(event.target)) return
      event.preventDefault()
      void openSearch()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openSearch])

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
          disabled={isSearchOpening}
          aria-busy={isSearchOpening}
          aria-keyshortcuts="/"
          onClick={() => void openSearch()}
        >
          <span className={styles.searchPlaceholder}>검색</span>
          <kbd className={styles.searchShortcut} aria-hidden>
            /
          </kbd>
        </button>
        <TopNavSettingsMenu
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          onRequestOpen={() => {
            setIsSettingsOpen(true)
          }}
        />
      </div>
      {isSearchOpen && searchSeed ? (
        <TopNavSearchModal
          isOpen
          seed={searchSeed}
          onClose={closeSearch}
        />
      ) : null}
    </>
  )
}
