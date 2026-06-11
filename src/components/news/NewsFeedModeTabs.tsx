import clsx from 'clsx'
import { UnderlineTabNav } from '../common/UnderlineTabNav'
import type { NewsFeedMode } from '../../hooks/useNewsFeedPage'
import styles from './NewsFeedModeTabs.module.css'

const FEED_MODE_OPTIONS = [
  { key: 'all' as const, label: '전체 뉴스' },
  { key: 'watchlist' as const, label: '관심종목 뉴스' },
]

interface NewsFeedModeTabsProps {
  mode: NewsFeedMode
  onModeChange: (mode: NewsFeedMode) => void
  className?: string
}

export function NewsFeedModeTabs({ mode, onModeChange, className }: NewsFeedModeTabsProps) {
  return (
    <div className={clsx(styles.root, className)}>
      <UnderlineTabNav
        ariaLabel="뉴스 피드 필터"
        options={FEED_MODE_OPTIONS}
        value={mode}
        onChange={onModeChange}
        variant="text"
        className={styles.nav}
      />
    </div>
  )
}
