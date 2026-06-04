/** `react-gauge-chart` 레이아웃과 맞춘 아크 위 점 좌표 (px, gaugeWrap 기준) */

export interface GaugeArcDotPosition {
  left: number
  top: number
}

export function computeGaugeArcDotPosition(
  containerWidth: number,
  containerHeight: number,
  options: {
    marginInPercent: number
    arcWidth: number
    percent: number
  },
): GaugeArcDotPosition {
  const { marginInPercent, arcWidth, percent } = options
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { left: containerWidth / 2, top: containerHeight / 2 }
  }

  const marginH = containerWidth * marginInPercent
  const innerWidth = containerWidth - marginH * 2
  const marginV = containerHeight * marginInPercent
  const innerHeight = innerWidth / 2 - marginV * 2

  const outerRadius =
    innerWidth < 2 * innerHeight ? innerWidth / 2 : innerHeight

  const centerX = containerWidth / 2
  const centerY = marginV + outerRadius
  const arcMidRadius = outerRadius * (1 - arcWidth / 2)
  const theta = percent * Math.PI

  return {
    left: centerX - arcMidRadius * Math.cos(theta),
    top: centerY - arcMidRadius * Math.sin(theta),
  }
}
