import { BackToTopButton } from './BackToTopButton'

interface PageFabRailProps {
  className?: string
  stockDetailMarker?: boolean
  scrollRootSelector?: string
}

/** 맨 위로 — 종목 상세와 동일하게 viewport 고정 (그리드 sticky 사용 안 함) */
export function PageFabRail({
  className,
  stockDetailMarker,
  scrollRootSelector,
}: PageFabRailProps) {
  return (
    <BackToTopButton
      placement="fixed"
      tooltipSide="left"
      className={className}
      stockDetailMarker={stockDetailMarker}
      scrollRootSelector={scrollRootSelector}
    />
  )
}
