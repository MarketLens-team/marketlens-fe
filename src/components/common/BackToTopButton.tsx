import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getLayoutScrollRoot } from '../../hooks/useInfiniteScroll'
import { IconCircleButton } from '../ui/IconCircleButton'
import styles from './BackToTopButton.module.css'

const SHOW_AFTER_PX = 200
const HIDE_BELOW_PX = 120

interface BackToTopButtonProps {
  /** inline: 부모 안 / fixed: 화면 하단 우측 컬럼 */
  placement?: 'inline' | 'fixed'
  /** 툴팁 방향 — 좁은 사이드바는 left */
  tooltipSide?: 'left' | 'right'
  className?: string
  /** 지정 시 해당 요소의 scrollTop 기준으로 표시·스크롤 (예: `#person-tracker-aside-scroll`) */
  scrollRootSelector?: string
  /** 종목 상세 타임라인 겹침 측정용 마커 */
  stockDetailMarker?: boolean
  /**
   * `always` — 인물 그리드 FAB 레일(4열) 등 전용 슬롯에서 항상 표시
   * `on-scroll`(기본) — 스크롤 후에만 표시
   */
  visibility?: 'always' | 'on-scroll'
  /** 스크롤 맨 위 이동과 함께 실행 (예: anchored 피드 → cursor 최신순 리셋) */
  onBackToTop?: () => void | Promise<void>
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
  stockDetailMarker = false,
  visibility = 'on-scroll',
  onBackToTop,
}: BackToTopButtonProps) {
  const [visible, setVisible] = useState(visibility === 'always')

  useEffect(() => {
    if (visibility === 'always') {
      setVisible(true)
      return
    }

    const root = resolveScrollRoot(scrollRootSelector)
    if (!root) return

    const onScroll = () => {
      const top = root.scrollTop
      setVisible((prev) => {
        if (top > SHOW_AFTER_PX) return true
        if (top < HIDE_BELOW_PX) return false
        return prev
      })
    }

    onScroll()
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [scrollRootSelector, visibility])

  const scrollToTop = useCallback(() => {
    resolveScrollRoot(scrollRootSelector)?.scrollTo({ top: 0, behavior: 'smooth' })
    void onBackToTop?.()
  }, [scrollRootSelector, onBackToTop])

  if (!visible) return null

  const node = (
    <div
      className={clsx(
        placement === 'fixed' ? styles.wrapFixed : styles.dock,
        className,
      )}
      {...(stockDetailMarker ? { 'data-stock-back-to-top': '' } : {})}
    >
      <div className={styles.btnWrap}>
        <IconCircleButton
          direction="up"
          size="lg"
          aria-label="맨 위로"
          onClick={scrollToTop}
        />
        <span
          className={clsx(styles.tooltip, tooltipSide === 'left' && styles.tooltipLeft)}
          role="tooltip"
        >
          맨 위로
        </span>
      </div>
    </div>
  )

  if (placement === 'fixed') {
    return createPortal(node, document.body)
  }

  return node
}
