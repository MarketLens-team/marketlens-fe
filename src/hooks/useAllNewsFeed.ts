import { useNewsFeedPage } from './useNewsFeedPage'

/** @deprecated `useNewsFeedPage('all')` 사용 */
export function useAllNewsFeed() {
  return useNewsFeedPage('all')
}
