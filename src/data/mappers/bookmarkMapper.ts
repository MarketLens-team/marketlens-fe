import type { BookmarkDateSummaryDto, BookmarkStockSummaryDto, NewsBookmarkDto, NewsBookmarkPageDto } from '../types/bookmark'
import type { MyPageBookmarkDateSummary, MyPageBookmarkItem, MyPageBookmarkPage, MyPageBookmarkStockSummary } from '../types/myPage'
import type { NewsBookmarkContextType } from '../types/bookmark'
import type { SentimentPolarity } from '../types/stock'
import { normalizeBookmarkContextType } from '../../lib/bookmarkNavigation'

function parseSentimentPolarity(sentiment: string): SentimentPolarity {
  const normalized = sentiment.trim().toLowerCase()
  if (normalized === 'positive' || normalized.includes('긍정')) return 'positive'
  if (normalized === 'negative' || normalized.includes('부정')) return 'negative'
  return 'neutral'
}

export function mapNewsBookmarkDto(dto: NewsBookmarkDto): MyPageBookmarkItem {
  return {
    id: String(dto.newsArticleId),
    title: dto.title,
    url: dto.originalLink?.trim() || undefined,
    source: dto.publisherName?.trim() || '출처 미상',
    publishedAt: dto.publishedAt,
    bookmarkedAt: dto.bookmarkedAt,
    imageUrl: dto.imageUrl ?? null,
    sentimentScore: dto.sentimentScore,
    sentiment: parseSentimentPolarity(dto.sentimentLabel),
    contextType: normalizeBookmarkContextType(dto.contextType),
    contextStockCode: dto.contextStockCode ?? null,
    contextStockName: dto.contextStockName ?? null,
    contextLabel: dto.contextLabel ?? null,
  }
}

export function mapNewsBookmarkList(dtos: NewsBookmarkDto[]): MyPageBookmarkItem[] {
  return dtos.map(mapNewsBookmarkDto)
}

export function mapNewsBookmarkPage(page: NewsBookmarkPageDto): MyPageBookmarkPage {
  return {
    items: page.content.map(mapNewsBookmarkDto),
    totalElements: page.totalElements,
    totalPages: page.totalPages,
    page: page.page,
  }
}

export function mapBookmarkStockSummaryDto(dto: BookmarkStockSummaryDto): MyPageBookmarkStockSummary {
  return {
    stockCode: dto.stockCode,
    stockName: dto.stockName,
    bookmarkCount: dto.bookmarkCount,
  }
}

export function mapBookmarkDateSummaryList(dtos: BookmarkDateSummaryDto[]): MyPageBookmarkDateSummary[] {
  return dtos.map((dto) => ({
    date: dto.date,
    count: dto.count,
    contexts: dto.contexts.map((ctx) => ({
      contextType: (ctx.contextType === 'ALL_NEWS' ? 'ALL_NEWS' : 'STOCK') as NewsBookmarkContextType,
      stockCode: ctx.stockCode ?? null,
      stockName: ctx.stockName ?? null,
      stockImageUrl: ctx.stockImageUrl ?? null,
      count: ctx.count,
    })),
  }))
}

export function mapBookmarkStockSummaryList(
  dtos: BookmarkStockSummaryDto[],
): MyPageBookmarkStockSummary[] {
  return dtos.map(mapBookmarkStockSummaryDto)
}
