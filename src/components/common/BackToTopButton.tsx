import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import { getLayoutScrollRoot } from '../../hooks/useInfiniteScroll'
import styles from './BackToTopButton.module.css'

const SHOW_AFTER_PX = 200

function ChevronUpIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        d="M6 15l6-6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface BackToTopButtonProps {
  /** inline: 부모 안 / fixed: 화면 하단 우측 컬럼 */
  placement?: 'inline' | 'fixed'
  /** 툴팁 방향 — 좁은 사이드바는 left */
  tooltipSide?: 'left' | 'right'
  className?: string
  /** 지정 시 해당 요소의 scrollTop 기준으로 표시·스크롤 (예: `#person-tracker-aside-scroll`) */
  scrollRootSelector?: string
}

function resolveScrollRoot(scrollRootSelector?: string): HTMLElement | null {
  const q = scrollRootSelector?.trim()
  if (q) return document.querySelector<HTMLElement>(q)
  return getLayoutScrollRoot()
}

export function BackToTopButton({
  placement = 'inline',
  tooltipSide = 'right',
  className,
  scrollRootSelector,
}: BackToTopButtonProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const root = resolveScrollRoot(scrollRootSelector)
    if (!root) return

    const onScroll = () => {
      setVisible(root.scrollTop > SHOW_AFTER_PX)
    }

    onScroll()
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [scrollRootSelector])

  const scrollToTop = useCallback(() => {
    resolveScrollRoot(scrollRootSelector)?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [scrollRootSelector])

  if (!visible) return null

  return (
    <div
      className={clsx(
        placement === 'fixed' ? styles.wrapFixed : styles.dock,
        className,
      )}
    >
      <button
        type="button"
        className={styles.btn}
        onClick={scrollToTop}
        aria-label="맨 위로"
      >
        <ChevronUpIcon />
        <span
          className={clsx(styles.tooltip, tooltipSide === 'left' && styles.tooltipLeft)}
          role="tooltip"
        >
          맨 위로
        </span>
      </button>
    </div>
  )
}
