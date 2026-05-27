import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { ApiEnvelope } from '../types/api'
import type {
  BookmarkStockSummaryDto,
  NewsBookmarkDto,
  NewsBookmarkListQuery,
  NewsBookmarkSaveContext,
} from '../types/bookmark'
import { getApiErrorMessage } from '../util/apiError'
import { unwrapApiEnvelope } from '../util/apiEnvelope'
import { mockDelay } from '../util/mockDelay'

const BOOKMARKS_PATH = '/api/v1/bookmarks'
const BOOKMARK_STOCKS_PATH = '/api/v1/bookmarks/stocks'

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

function buildBookmarkListQuery(query?: NewsBookmarkListQuery): string {
  if (!query) return ''
  const params = new URLSearchParams()
  if (query.contextType) params.set('contextType', query.contextType)
  if (query.contextStockCode?.trim()) params.set('contextStockCode', query.contextStockCode.trim())
  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export async function fetchNewsBookmarks(query?: NewsBookmarkListQuery): Promise<NewsBookmarkDto[]> {
  if (isMockDataSource()) {
    await mockDelay(120)
    const rows = Array.from(mockBookmarks.entries()).map(([newsArticleId, row]) => ({
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
    if (query?.contextStockCode?.trim()) {
      const code = query.contextStockCode.trim()
      return rows.filter(
        (row) =>
          row.contextType === 'STOCK' &&
          row.contextStockCode === code &&
          (!query.contextType || query.contextType === 'STOCK'),
      )
    }
    if (query?.contextType === 'ALL_NEWS') {
      return rows.filter((row) => row.contextType === 'ALL_NEWS')
    }
    if (query?.contextType === 'STOCK') {
      return rows.filter((row) => row.contextType === 'STOCK')
    }
    return rows
  }
  try {
    const { data } = await api.get<ApiEnvelope<NewsBookmarkDto[]>>(
      `${BOOKMARKS_PATH}${buildBookmarkListQuery(query)}`,
    )
    return unwrapApiEnvelope(data, '즐겨찾기를 불러오지 못했습니다.') ?? []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '즐겨찾기를 불러오지 못했습니다.'))
  }
}

export async function fetchBookmarkStockSummaries(): Promise<BookmarkStockSummaryDto[]> {
  if (isMockDataSource()) {
    await mockDelay(120)
    const counts = new Map<string, { stockName: string; bookmarkCount: number }>()
    for (const row of mockBookmarks.values()) {
      if (row.context.type !== 'STOCK' || !row.context.stockCode?.trim()) continue
      const stockCode = row.context.stockCode.trim()
      const prev = counts.get(stockCode)
      counts.set(stockCode, {
        stockName: stockCode,
        bookmarkCount: (prev?.bookmarkCount ?? 0) + 1,
      })
    }
    return Array.from(counts.entries()).map(([stockCode, summary]) => ({
      stockCode,
      stockName: summary.stockName,
      bookmarkCount: summary.bookmarkCount,
    }))
  }
  try {
    const { data } = await api.get<ApiEnvelope<BookmarkStockSummaryDto[]>>(BOOKMARK_STOCKS_PATH)
    return unwrapApiEnvelope(data, '종목별 즐겨찾기를 불러오지 못했습니다.') ?? []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '종목별 즐겨찾기를 불러오지 못했습니다.'))
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
