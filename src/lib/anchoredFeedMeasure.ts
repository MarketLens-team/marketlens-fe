import { ANCHORED_WARM_VIEWPORT_RATIO } from '../data/types/anchoredFeed'
import { getLayoutScrollRoot } from '../hooks/useInfiniteScroll'

export const ANCHORED_FEED_LIST_SELECTOR = '[data-anchored-feed-list]'

export function measureAnchoredFeedContentHeight(): number {
  const root = getLayoutScrollRoot()
  if (!root) return 0
  const list = root.querySelector<HTMLElement>(ANCHORED_FEED_LIST_SELECTOR)
  return list?.scrollHeight ?? root.scrollHeight
}

export function shouldWarmAnchoredViewport(): boolean {
  const root = getLayoutScrollRoot()
  if (!root) return false
  return measureAnchoredFeedContentHeight() < root.clientHeight * ANCHORED_WARM_VIEWPORT_RATIO
}
