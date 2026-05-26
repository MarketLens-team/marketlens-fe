/** 전체 뉴스 피드 `?newsId=` 포커스 — DOM id·스크롤 */
export function newsFeedItemElementId(newsId: string) {
  return `news-feed-item-${newsId}`
}

/** Layout `[data-scroll-root]` 기준으로 피드 행으로 스크롤 */
export function scrollNewsFeedItemIntoView(newsId: string): boolean {
  const el = document.getElementById(newsFeedItemElementId(newsId))
  if (!el) return false

  const scrollRoot = document.querySelector<HTMLElement>('[data-scroll-root]')
  if (scrollRoot) {
    const rootRect = scrollRoot.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const targetTop =
      scrollRoot.scrollTop +
      (elRect.top - rootRect.top) -
      Math.max(0, (scrollRoot.clientHeight - elRect.height) / 2)
    scrollRoot.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
    return true
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  return true
}
