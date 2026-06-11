import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchUnifiedSearch } from '../../data/clients/searchClient'
import { withMinDuration } from '../../lib/withMinDuration'
import type { UnifiedSearchResult } from '../../data/types/search'
import { useAuthStore } from '../../store/authStore'
import { useAuthModalStore } from '../../store/authModalStore'
import { TopNavSearchModal } from './TopNavSearchModal'
import { TopNavSettingsMenu } from './TopNavSettingsMenu'
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

function SearchIcon() {
  return (
    <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16.5 16.5L20 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TopNavActions() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openAuthModal = useAuthModalStore((s) => s.open)
  const closeAuthModal = useAuthModalStore((s) => s.close)
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
    closeAuthModal()

    try {
      const data = await withMinDuration(() => fetchUnifiedSearch(''))
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
        <button
          type="button"
          className={styles.searchTrigger}
          disabled={isSearchOpening}
          aria-busy={isSearchOpening}
          aria-keyshortcuts="/"
          aria-label="/ 키로 검색 열기"
          onClick={() => void openSearch()}
        >
          <SearchIcon />
          <span className={styles.searchPlaceholder}>/ 를 눌러 검색하세요</span>
        </button>
        {isLoggedIn ? (
          <TopNavSettingsMenu
            isOpen={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            onRequestOpen={() => {
              setIsSettingsOpen(true)
            }}
          />
        ) : (
          <button
            type="button"
            className={styles.loginTrigger}
            onClick={() => {
              setIsSettingsOpen(false)
              openAuthModal()
            }}
          >
            로그인
          </button>
        )}
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
