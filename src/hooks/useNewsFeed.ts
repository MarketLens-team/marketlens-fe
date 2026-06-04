import { useCallback } from 'react'
import { fetchNewsFeed } from '../data/clients/newsClient'
import type { NewsFeedItem } from '../data/types/news'
import { useAsyncData } from './useAsyncData'

export function useNewsFeed() {
  const factory = useCallback(() => fetchNewsFeed(), [])
  return useAsyncData<NewsFeedItem[]>(factory)
}
