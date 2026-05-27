import clsx from 'clsx'
import type { NewsFeedMode } from '../../hooks/useNewsFeedPage'
import styles from './NewsFeedModeTabs.module.css'

interface NewsFeedModeTabsProps {
  mode: NewsFeedMode
  onModeChange: (mode: NewsFeedMode) => void
  className?: string
}

export function NewsFeedModeTabs({ mode, onModeChange, className }: NewsFeedModeTabsProps) {
  return (
    <div className={clsx(styles.root, className)} role="tablist" aria-label="뉴스 피드 필터">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'all'}
        className={clsx(styles.tab, mode === 'all' && styles.tabActive)}
        onClick={() => onModeChange('all')}
      >
        전체 뉴스
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'watchlist'}
        className={clsx(styles.tab, mode === 'watchlist' && styles.tabActive)}
        onClick={() => onModeChange('watchlist')}
      >
        관심종목 뉴스
      </button>
    </div>
  )
}
