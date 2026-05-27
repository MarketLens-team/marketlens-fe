import { useCallback, useEffect, useState } from 'react'
import { fetchBookmarkStockSummaries, fetchNewsBookmarks } from '../data/clients/bookmarkClient'
import { mapBookmarkStockSummaryList, mapNewsBookmarkPage } from '../data/mappers/bookmarkMapper'
import type { BookmarkSortOrder } from '../data/types/bookmark'
import type { MyPageBookmarkItem, MyPageBookmarkPage, MyPageBookmarkStockSummary, MyPageBookmarkView } from '../data/types/myPage'
import { useAsyncData } from './useAsyncData'

const PAGE_SIZE = 10

export function useMyPageBookmarks(refreshKey: number) {
  const [view, setView] = useState<MyPageBookmarkView>('date')
  const [selectedStockCode, setSelectedStockCode] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<BookmarkSortOrder>('LATEST')
  const [page, setPage] = useState(0)

  // view·sortOrder·selectedStockCode·refreshKey 바뀌면 페이지 리셋
  useEffect(() => {
    setPage(0)
  }, [view, sortOrder, selectedStockCode, refreshKey])

  const dateFactory = useCallback(async (): Promise<MyPageBookmarkPage> => {
    const raw = await fetchNewsBookmarks({ page, size: PAGE_SIZE, sortOrder })
    return mapNewsBookmarkPage(raw)
  }, [refreshKey, page, sortOrder]) // eslint-disable-line react-hooks/exhaustive-deps

  const stockSummariesFactory = useCallback(async (): Promise<MyPageBookmarkStockSummary[]> => {
    const rows = await fetchBookmarkStockSummaries()
    return mapBookmarkStockSummaryList(rows)
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const stockBookmarksFactory = useCallback(async (): Promise<MyPageBookmarkPage> => {
    if (!selectedStockCode) return { items: [], totalElements: 0, totalPages: 0, page: 0 }
    const raw = await fetchNewsBookmarks({
      contextStockCode: selectedStockCode,
      page,
      size: PAGE_SIZE,
      sortOrder,
    })
    return mapNewsBookmarkPage(raw)
  }, [refreshKey, selectedStockCode, page, sortOrder]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const activePage = view === 'date' ? dateState.data : stockBookmarksState.data
  const items: MyPageBookmarkItem[] = activePage?.items ?? []
  const totalPages = activePage?.totalPages ?? 0
  const totalElements = activePage?.totalElements ?? 0

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

  const changeSortOrder = useCallback((next: BookmarkSortOrder) => {
    setSortOrder(next)
  }, [])

  const goToPage = useCallback((next: number) => {
    setPage(next)
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
    totalPages,
    totalElements,
    page,
    sortOrder,
    changeSortOrder,
    goToPage,
    initialLoading,
    sectionReady,
    error,
    refreshing,
  }
}
