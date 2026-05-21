export const TOP_MENUS = [
  { label: '홈', to: '/', end: true },
  { label: '종목', to: '/stock/005930', end: true, matchStockDetail: true },
  { label: '언급량 급등', to: '/buzz', end: true },
  { label: '인물 발언', to: '/person', end: true },
] as const

export type TopMenuItem = (typeof TOP_MENUS)[number]

export function isTopNavActive(pathname: string, item: TopMenuItem) {
  if ('matchStockDetail' in item && item.matchStockDetail) {
    return /^\/stock\/.+/.test(pathname)
  }
  if (item.end) {
    return pathname === item.to
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}
