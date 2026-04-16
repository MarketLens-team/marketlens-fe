import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import styles from './DevWatchlistPopover.module.css'

const WATCHLIST_ITEMS = ['삼성전자', '반도체', '이재용', 'SK하이닉스', '2차전지'] as const

interface DevWatchlistPopoverProps {
  suppressPanel?: boolean
  onRequestOpen?: () => void
}

export function DevWatchlistPopover({ suppressPanel = false, onRequestOpen }: DevWatchlistPopoverProps) {
  return (
    <div
      className={styles.wrap}
      onMouseEnter={onRequestOpen}
      onFocusCapture={onRequestOpen}
      data-suppress-panel={suppressPanel ? 'true' : undefined}
    >
      <NavLink
        to="/dev/watchlist"
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
          <h3>My First Watchlist</h3>
          <button type="button">전체 보기</button>
        </header>
        <div className={styles.tabs}>
          <button type="button" className={styles.tabActive}>
            종목
          </button>
          <button type="button" className={styles.tab}>
            섹터
          </button>
          <button type="button" className={styles.tab}>
            인물
          </button>
        </div>
        <div className={styles.body}>
          <p className={styles.lead}>관심 항목 추가하기</p>
          <div className={styles.chips}>
            {WATCHLIST_ITEMS.map((item) => (
              <button key={item} type="button">
                {item} +
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
