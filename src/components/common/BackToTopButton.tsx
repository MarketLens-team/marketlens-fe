import { useCallback, useEffect, useState } from 'react'
import { getLayoutScrollRoot } from '../../hooks/useInfiniteScroll'
import styles from './BackToTopButton.module.css'

const SHOW_AFTER_PX = 320

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

export function BackToTopButton() {
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
    <div className={styles.dock}>
      <button
        type="button"
        className={styles.btn}
        onClick={scrollToTop}
        aria-label="맨 위로"
      >
        <ChevronUpIcon />
        <span className={styles.tooltip} role="tooltip">
          맨 위로
        </span>
      </button>
    </div>
  )
}
