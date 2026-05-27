import { useCallback, useEffect, useState } from 'react'
import { fetchBookmarkStockSummaries, fetchNewsBookmarks } from '../data/clients/bookmarkClient'
import { mapBookmarkStockSummaryList, mapNewsBookmarkList } from '../data/mappers/bookmarkMapper'
import type { MyPageBookmarkItem, MyPageBookmarkStockSummary, MyPageBookmarkView } from '../data/types/myPage'
import { useAsyncData } from './useAsyncData'

export function useMyPageBookmarks(refreshKey: number) {
  const [view, setView] = useState<MyPageBookmarkView>('date')
  const [selectedStockCode, setSelectedStockCode] = useState<string | null>(null)

  const dateFactory = useCallback(async (): Promise<MyPageBookmarkItem[]> => {
    const rows = await fetchNewsBookmarks()
    return mapNewsBookmarkList(rows)
  }, [refreshKey])

  const stockSummariesFactory = useCallback(async (): Promise<MyPageBookmarkStockSummary[]> => {
    const rows = await fetchBookmarkStockSummaries()
    return mapBookmarkStockSummaryList(rows)
  }, [refreshKey])

  const stockBookmarksFactory = useCallback(async (): Promise<MyPageBookmarkItem[]> => {
    if (!selectedStockCode) return []
    const rows = await fetchNewsBookmarks({ contextStockCode: selectedStockCode })
    return mapNewsBookmarkList(rows)
  }, [refreshKey, selectedStockCode])

  const dateState = useAsyncData(dateFactory)
  const stockSummariesState = useAsyncData(stockSummariesFactory, { enabled: view === 'stock' })
  const stockBookmarksState = useAsyncData(stockBookmarksFactory, {
    enabled: view === 'stock' && selectedStockCode != null,
    keepPreviousData: true,
  })

  const stockSummaries = stockSummariesState.data ?? []

  useEffect(() => {
    if (view !== 'stock' || stockSummariesState.loading || stockSummariesState.error) return
    if (stockSummaries.length === 0) {
      setSelectedStockCode(null)
      return
    }
    if (!selectedStockCode || !stockSummaries.some((row) => row.stockCode === selectedStockCode)) {
      setSelectedStockCode(stockSummaries[0].stockCode)
    }
  }, [view, stockSummaries, selectedStockCode, stockSummariesState.loading, stockSummariesState.error])

  const items =
    view === 'date' ? (dateState.data ?? []) : (stockBookmarksState.data ?? [])
  const initialLoading =
    view === 'date'
      ? dateState.loading && dateState.data == null
      : stockSummariesState.loading && stockSummariesState.data == null
  const sectionReady =
    view === 'date'
      ? !initialLoading
      : !stockSummariesState.loading || stockSummariesState.data != null
  const error = view === 'date' ? dateState.error : stockSummariesState.error ?? stockBookmarksState.error
  const refreshing =
    view === 'date'
      ? dateState.refreshing
      : stockSummariesState.refreshing || stockBookmarksState.refreshing

  const selectStock = useCallback((stockCode: string) => {
    setSelectedStockCode(stockCode)
  }, [])

  const changeView = useCallback((next: MyPageBookmarkView) => {
    setView(next)
  }, [])

  return {
    view,
    changeView,
    selectedStockCode,
    selectStock,
    stockSummaries,
    stockSummariesLoading: stockSummariesState.loading && stockSummariesState.data == null,
    stockBookmarksLoading:
      view === 'stock' &&
      selectedStockCode != null &&
      stockBookmarksState.loading &&
      stockBookmarksState.data == null,
    items,
    initialLoading,
    sectionReady,
    error,
    refreshing,
  }
}
