/** 전체 뉴스 피드 `?newsId=` 포커스 — DOM id·스크롤 */
export function newsFeedItemElementId(newsId: string) {
  return `news-feed-item-${newsId}`
}

export function stockNewsItemElementId(newsId: string) {
  return `stock-news-${newsId}`
}

function scrollElementInLayoutRoot(elementId: string): boolean {
  const el = document.getElementById(elementId)
  if (!el) return false

  const scrollRoot = document.querySelector<HTMLElement>('[data-scroll-root]')
  if (scrollRoot) {
    const rootRect = scrollRoot.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const targetTop =
      scrollRoot.scrollTop +
      (elRect.top - rootRect.top) -
      Math.max(0, (scrollRoot.clientHeight - elRect.height) / 2)
    scrollRoot.scrollTo({ top: Math.max(0, targetTop), behavior: 'instant' })
    return true
  }

  el.scrollIntoView({ behavior: 'instant', block: 'center' })
  return true
}

/** Layout `[data-scroll-root]` 기준으로 피드 행으로 스크롤 */
export function scrollNewsFeedItemIntoView(newsId: string): boolean {
  return scrollElementInLayoutRoot(newsFeedItemElementId(newsId))
}

/** 종목 상세 관련 뉴스 목록 — 동일 스크롤 루트 */
export function scrollStockNewsItemIntoView(newsId: string): boolean {
  return scrollElementInLayoutRoot(stockNewsItemElementId(newsId))
}
