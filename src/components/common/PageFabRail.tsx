import clsx from 'clsx'
import { BackToTopButton } from './BackToTopButton'
import styles from './PageFabRail.module.css'

interface PageFabRailProps {
  className?: string
  stockDetailMarker?: boolean
}

/** 뉴스·인물·종목 공통 — 우측 FAB 레일에 맨 위로 버튼 */
export function PageFabRail({ className, stockDetailMarker }: PageFabRailProps) {
  return (
    <aside
      className={clsx(styles.rail, styles.railMobileFixed, className)}
      aria-label="페이지 탐색"
    >
      <BackToTopButton
        placement="inline"
        tooltipSide="left"
        stockDetailMarker={stockDetailMarker}
      />
    </aside>
  )
}
