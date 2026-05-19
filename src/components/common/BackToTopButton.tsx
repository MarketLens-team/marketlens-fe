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
  /** 툴팁 방향 — 좁은 사이드바는 left */
  tooltipSide?: 'left' | 'right'
  className?: string
}

export function BackToTopButton({
  tooltipSide = 'right',
  className,
}: BackToTopButtonProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const root = getLayoutScrollRoot()
    if (!root) return

    const onScroll = () => {
      setVisible(root.scrollTop > SHOW_AFTER_PX)
    }

    onScroll()
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    getLayoutScrollRoot()?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (!visible) return null

  return (
    <div className={clsx(styles.dock, className)}>
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
