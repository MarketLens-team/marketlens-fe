import type { NewsBookmarkDto } from '../types/bookmark'
import type { MyPageBookmarkItem } from '../types/myPage'
import type { SentimentPolarity } from '../types/stock'

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
  }
}

export function mapNewsBookmarkList(dtos: NewsBookmarkDto[]): MyPageBookmarkItem[] {
  return dtos.map(mapNewsBookmarkDto)
}
