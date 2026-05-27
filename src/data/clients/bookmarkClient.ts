import { isMockDataSource } from '../../config/dataSource'
import { api } from '../../services/api'
import type { ApiEnvelope } from '../types/api'
import type {
  BookmarkDateSummaryDto,
  BookmarkStockSummaryDto,
  NewsBookmarkDto,
  NewsBookmarkListQuery,
  NewsBookmarkPageDto,
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
  if (query.publishedDate) params.set('publishedDate', query.publishedDate)
  if (query.page != null) params.set('page', String(query.page + 1)) // 내부 0-based → API 1-based
  if (query.size != null) params.set('size', String(query.size))
  if (query.sortOrder) params.set('sortOrder', query.sortOrder)
  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export async function fetchNewsBookmarks(query?: NewsBookmarkListQuery): Promise<NewsBookmarkPageDto> {
  if (isMockDataSource()) {
    await mockDelay(120)
    let rows = Array.from(mockBookmarks.entries()).map(([newsArticleId, row]) => ({
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
      contextLabel: null,
      sentimentScore: 0,
      sentimentLabel: 'neutral',
    }))
    if (query?.contextStockCode?.trim()) {
      const code = query.contextStockCode.trim()
      rows = rows.filter(
        (row) =>
          row.contextType === 'STOCK' &&
          row.contextStockCode === code &&
          (!query.contextType || query.contextType === 'STOCK'),
      )
    } else if (query?.contextType === 'ALL_NEWS') {
      rows = rows.filter((row) => row.contextType === 'ALL_NEWS')
    } else if (query?.contextType === 'STOCK') {
      rows = rows.filter((row) => row.contextType === 'STOCK')
    }
    if (query?.publishedDate) {
      const d = query.publishedDate
      rows = rows.filter((row) => row.publishedAt.startsWith(d))
    }
    if (query?.sortOrder === 'OLDEST') rows = [...rows].reverse()
    const size = query?.size ?? 10
    const page = query?.page ?? 0
    const totalElements = rows.length
    const totalPages = Math.max(1, Math.ceil(totalElements / size))
    const content = rows.slice(page * size, page * size + size)
    return { content, totalElements, totalPages, page }
  }
  try {
    const { data } = await api.get<ApiEnvelope<NewsBookmarkPageDto>>(
      `${BOOKMARKS_PATH}${buildBookmarkListQuery(query)}`,
    )
    return unwrapApiEnvelope(data, '즐겨찾기를 불러오지 못했습니다.') ?? {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: query?.page ?? 0,
    }
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

export async function fetchBookmarkDateSummaries(): Promise<BookmarkDateSummaryDto[]> {
  if (isMockDataSource()) {
    await mockDelay(120)
    const byDate = new Map<string, { count: number; contexts: Map<string, { contextType: string; stockCode: string | null; stockName: string | null; count: number }> }>()
    for (const [, row] of mockBookmarks.entries()) {
      const date = new Date().toISOString().slice(0, 10)
      const entry = byDate.get(date) ?? { count: 0, contexts: new Map() }
      entry.count++
      const ctxKey = row.context.type === 'STOCK' ? `STOCK:${row.context.stockCode ?? ''}` : 'ALL_NEWS'
      const ctx = entry.contexts.get(ctxKey) ?? { contextType: row.context.type, stockCode: row.context.stockCode ?? null, stockName: row.context.stockCode ?? null, count: 0 }
      ctx.count++
      entry.contexts.set(ctxKey, ctx)
      byDate.set(date, entry)
    }
    return Array.from(byDate.entries()).map(([date, entry]) => ({
      date,
      count: entry.count,
      contexts: Array.from(entry.contexts.values()).map((c) => ({
        contextType: c.contextType,
        stockCode: c.stockCode,
        stockName: c.stockName,
        stockImageUrl: null,
        count: c.count,
      })),
    }))
  }
  try {
    const { data } = await api.get<ApiEnvelope<BookmarkDateSummaryDto[]>>('/api/v1/bookmarks/dates')
    return unwrapApiEnvelope(data, '날짜별 집계를 불러오지 못했습니다.') ?? []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '날짜별 집계를 불러오지 못했습니다.'))
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
