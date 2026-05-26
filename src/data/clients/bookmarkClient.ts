import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { ApiEnvelope } from '../types/api'
import type { NewsBookmarkDto } from '../types/bookmark'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const BOOKMARKS_PATH = '/api/v1/bookmarks'

const mockBookmarkIds = new Set<number>()

export async function fetchNewsBookmarks(): Promise<NewsBookmarkDto[]> {
  if (isMockDataSource()) {
    await mockDelay(120)
    return []
  }
  try {
    const { data } = await api.get<ApiEnvelope<NewsBookmarkDto[]>>(BOOKMARKS_PATH)
    return unwrapApiEnvelope(data, '즐겨찾기를 불러오지 못했습니다.') ?? []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '즐겨찾기를 불러오지 못했습니다.'))
  }
}

export async function addNewsBookmark(newsArticleId: string): Promise<void> {
  if (isMockDataSource()) {
    await mockDelay(80)
    const id = Number(newsArticleId)
    if (Number.isFinite(id)) mockBookmarkIds.add(id)
    return
  }
  await api.post(`${BOOKMARKS_PATH}/${encodeURIComponent(newsArticleId)}`)
}

export async function removeNewsBookmark(newsArticleId: string): Promise<void> {
  if (isMockDataSource()) {
    await mockDelay(80)
    const id = Number(newsArticleId)
    if (Number.isFinite(id)) mockBookmarkIds.delete(id)
    return
  }
  await api.delete(`${BOOKMARKS_PATH}/${encodeURIComponent(newsArticleId)}`)
}
