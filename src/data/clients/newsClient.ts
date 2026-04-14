import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { NewsFeedItem } from '../types/news'
import { mockNewsFeed } from '../mocks/news.mock'
import { mockDelay } from '../util/mockDelay'

/** 백엔드 연동 시 경로만 맞추면 됩니다. */
const FEED_PATH = '/api/v1/news/feed'

export async function fetchNewsFeed(): Promise<NewsFeedItem[]> {
  if (isMockDataSource()) {
    await mockDelay()
    return structuredClone(mockNewsFeed)
  }
  const { data } = await api.get<NewsFeedItem[]>(FEED_PATH)
  return data
}
