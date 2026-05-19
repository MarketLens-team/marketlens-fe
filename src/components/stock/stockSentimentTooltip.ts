const TOOLTIP_WIDTH = 220
const TOOLTIP_HEIGHT = 140
const MARGIN = 10
const OFFSET_X = 16
const OFFSET_Y = 12

export interface TooltipPosition {
  left: number
  top: number
  placement: 'right' | 'left'
  /** 커서 위/아래 배치 */
  vertical: 'above' | 'below'
}

/**
 * Lightweight Charts 커스텀 tooltip — chartArea overflow 내에 완전히 들어가도록 배치
 * (top은 툴팁 박스 상단 좌표, transform 없음)
 */
export function computeTooltipPosition(
  chartWidth: number,
  chartHeight: number,
  pointerX: number,
  pointerY: number,
): TooltipPosition {
  const maxTop = chartHeight - TOOLTIP_HEIGHT - MARGIN
  const spaceAbove = pointerY - MARGIN
  const spaceBelow = chartHeight - MARGIN - pointerY

  let vertical: 'above' | 'below' = 'above'
  let top = pointerY - TOOLTIP_HEIGHT - OFFSET_Y

  if (spaceAbove < TOOLTIP_HEIGHT + OFFSET_Y && spaceBelow >= spaceAbove) {
    vertical = 'below'
    top = pointerY + OFFSET_Y
  }

  top = Math.max(MARGIN, Math.min(top, maxTop))

  const fitsRight = pointerX + OFFSET_X + TOOLTIP_WIDTH <= chartWidth - MARGIN
  if (fitsRight) {
    return {
      left: pointerX + OFFSET_X,
      top,
      placement: 'right',
      vertical,
    }
  }

  return {
    left: Math.max(MARGIN, pointerX - OFFSET_X - TOOLTIP_WIDTH),
    top,
    placement: 'left',
    vertical,
  }
}
