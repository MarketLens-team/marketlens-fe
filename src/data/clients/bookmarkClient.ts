import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { ApiEnvelope } from '../types/api'
import type { NewsBookmarkDto, NewsBookmarkSaveContext } from '../types/bookmark'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const BOOKMARKS_PATH = '/api/v1/bookmarks'

interface MockBookmarkRow {
  context: NewsBookmarkSaveContext
}

const mockBookmarks = new Map<number, MockBookmarkRow>()

function buildAddBookmarkQuery(context: NewsBookmarkSaveContext): URLSearchParams {
  const params = new URLSearchParams({ contextType: context.type })
  if (context.type === 'STOCK' && context.stockCode?.trim()) {
    params.set('contextStockCode', context.stockCode.trim())
  }
  return params
}

export async function fetchNewsBookmarks(): Promise<NewsBookmarkDto[]> {
  if (isMockDataSource()) {
    await mockDelay(120)
    return Array.from(mockBookmarks.entries()).map(([newsArticleId, row]) => ({
      bookmarkId: newsArticleId,
      newsArticleId,
      title: `저장 뉴스 #${newsArticleId}`,
      originalLink: null,
      publisherName: 'Mock',
      publishedAt: new Date().toISOString(),
      imageUrl: null,
      bookmarkedAt: new Date().toISOString(),
      contextType: row.context.type,
      contextStockCode: row.context.type === 'STOCK' ? row.context.stockCode ?? null : null,
      contextStockName: row.context.type === 'STOCK' ? row.context.stockCode ?? null : null,
      sentimentScore: 0,
      sentimentLabel: 'neutral',
    }))
  }
  try {
    const { data } = await api.get<ApiEnvelope<NewsBookmarkDto[]>>(BOOKMARKS_PATH)
    return unwrapApiEnvelope(data, '즐겨찾기를 불러오지 못했습니다.') ?? []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '즐겨찾기를 불러오지 못했습니다.'))
  }
}

export async function addNewsBookmark(
  newsArticleId: string,
  context: NewsBookmarkSaveContext,
): Promise<void> {
  if (isMockDataSource()) {
    await mockDelay(80)
    const id = Number(newsArticleId)
    if (Number.isFinite(id)) mockBookmarks.set(id, { context })
    return
  }
  const query = buildAddBookmarkQuery(context).toString()
  await api.post(`${BOOKMARKS_PATH}/${encodeURIComponent(newsArticleId)}?${query}`)
}

export async function removeNewsBookmark(newsArticleId: string): Promise<void> {
  if (isMockDataSource()) {
    await mockDelay(80)
    const id = Number(newsArticleId)
    if (Number.isFinite(id)) mockBookmarks.delete(id)
    return
  }
  await api.delete(`${BOOKMARKS_PATH}/${encodeURIComponent(newsArticleId)}`)
}
