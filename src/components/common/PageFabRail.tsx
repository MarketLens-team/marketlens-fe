import { BackToTopButton } from './BackToTopButton'

interface PageFabRailProps {
  className?: string
  stockDetailMarker?: boolean
  scrollRootSelector?: string
  /** 인물 페이지 — 스크롤 위치와 무관하게 항상 표시 */
  alwaysVisible?: boolean
  onBackToTop?: () => void | Promise<void>
}

/**
 * 맨 위로 — viewport `fixed` (page-max 우측 4열 정렬).
 * 그리드 4열 여백은 페이지에서 `fabRail` 빈 칸으로 확보.
 */
export function PageFabRail({
  className,
  stockDetailMarker,
  scrollRootSelector,
  alwaysVisible = false,
  onBackToTop,
}: PageFabRailProps) {
  return (
    <BackToTopButton
      placement="fixed"
      tooltipSide="left"
      className={className}
      stockDetailMarker={stockDetailMarker}
      scrollRootSelector={scrollRootSelector}
      visibility={alwaysVisible ? 'always' : 'on-scroll'}
      onBackToTop={onBackToTop}
    />
  )
}
