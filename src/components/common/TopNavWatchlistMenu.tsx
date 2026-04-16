import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useWatchlistStore } from '../../store/watchlistStore'
import styles from './TopNavWatchlistMenu.module.css'

interface TopNavWatchlistMenuProps {
  suppressPanel?: boolean
  onRequestOpen?: () => void
}

export function TopNavWatchlistMenu({ suppressPanel = false, onRequestOpen }: TopNavWatchlistMenuProps) {
  const items = useWatchlistStore((s) => s.items)
  const remove = useWatchlistStore((s) => s.remove)

  return (
    <div
      className={styles.wrap}
      onMouseEnter={onRequestOpen}
      onFocusCapture={onRequestOpen}
      data-suppress-panel={suppressPanel ? 'true' : undefined}
    >
      <NavLink
        to="/watchlist"
        className={({ isActive }) => clsx(styles.trigger, isActive && styles.triggerActive)}
        aria-haspopup="dialog"
      >
        <span className={styles.star} aria-hidden>
          ★
        </span>
        관심 목록
      </NavLink>

      <section className={clsx(styles.panel, suppressPanel && styles.panelSuppressed)} aria-label="관심 목록 패널">
        <header className={styles.header}>
          <h3 className={styles.title}>Watchlist</h3>
          <span className={styles.count}>{items.length}개</span>
        </header>

        {items.length === 0 ? <p className={styles.empty}>관심 종목이 없습니다. 검색에서 추가해 주세요.</p> : null}

        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.code} className={styles.item}>
              <div className={styles.meta}>
                <p className={styles.name}>{item.name}</p>
                <p className={styles.code}>{item.code}</p>
              </div>
              <button type="button" className={styles.remove} onClick={() => remove(item.code)}>
                제거
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
