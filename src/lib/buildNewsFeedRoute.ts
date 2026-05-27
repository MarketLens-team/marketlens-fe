import type { NewsFeedMode } from './newsFeedSession'

/** 전체·관심 뉴스 피드 경로 (`?newsId=` 시 anchored around) */
export function buildNewsFeedPath(options?: { newsId?: string; mode?: NewsFeedMode }): string {
  const path = '/news'
  if (!options?.newsId?.trim()) return path
  const params = new URLSearchParams({ newsId: options.newsId.trim() })
  if (options.mode === 'watchlist') params.set('feed', 'watchlist')
  return `${path}?${params.toString()}`
}
