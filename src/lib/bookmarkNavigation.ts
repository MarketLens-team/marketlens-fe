import type { NewsBookmarkContextType } from '../data/types/bookmark'
import type { MyPageBookmarkItem } from '../data/types/myPage'
import { buildNewsFeedPath } from './buildNewsFeedRoute'
import { buildStockDetailPath } from './buildStockRoute'

export function normalizeBookmarkContextType(value: string | null | undefined): NewsBookmarkContextType {
  if (value?.trim().toUpperCase() === 'STOCK') return 'STOCK'
  return 'ALL_NEWS'
}

export function formatBookmarkContextLabel(item: {
  contextType: NewsBookmarkContextType
  contextStockCode?: string | null
  contextStockName?: string | null
}): string {
  if (item.contextType === 'STOCK') {
    if (item.contextStockName?.trim()) {
      return `${item.contextStockName.trim()} 뉴스에서 저장`
    }
    if (item.contextStockCode?.trim()) {
      return `${item.contextStockCode.trim()} 뉴스에서 저장`
    }
    return '종목 뉴스에서 저장'
  }
  return '전체 뉴스에서 저장'
}

export function buildBookmarkItemPath(item: Pick<MyPageBookmarkItem, 'id' | 'contextType' | 'contextStockCode'>): string {
  if (item.contextType === 'STOCK' && item.contextStockCode?.trim()) {
    return buildStockDetailPath(item.contextStockCode.trim(), { newsId: item.id })
  }
  return buildNewsFeedPath({ newsId: item.id })
}
