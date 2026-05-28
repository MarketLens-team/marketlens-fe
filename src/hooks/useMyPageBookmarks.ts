import { useCallback, useEffect, useState } from 'react'
import { fetchBookmarkDateSummaries, fetchNewsBookmarks } from '../data/clients/bookmarkClient'
import { mapBookmarkDateSummaryList, mapNewsBookmarkPage } from '../data/mappers/bookmarkMapper'
import type { BookmarkSortOrder } from '../data/types/bookmark'
import type { MyPageBookmarkDateSummary, MyPageBookmarkPage } from '../data/types/myPage'
import { useAsyncData } from './useAsyncData'

const PAGE_SIZE = 10

export function useMyPageBookmarks(refreshKey: number) {
  const [sortOrder, setSortOrder] = useState<BookmarkSortOrder>('LATEST')
  const [page, setPage] = useState(0)
  const [filterDate, setFilterDate] = useState<string | null>(null)

  // sort·filterDate·refreshKey 변경 시 페이지 리셋
  useEffect(() => { setPage(0) }, [sortOrder, filterDate, refreshKey])

  // 삭제 후 날짜 필터 유지 (refreshKey 변경 시 필터 유지)
  // 필터는 사용자가 직접 해제

  const listFactory = useCallback(async (): Promise<MyPageBookmarkPage> => {
    const raw = await fetchNewsBookmarks({
      page,
      size: PAGE_SIZE,
      sortOrder,
      publishedDate: filterDate ?? undefined,
    })
    return mapNewsBookmarkPage(raw)
  }, [refreshKey, page, sortOrder, filterDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const dateSummariesFactory = useCallback(async (): Promise<MyPageBookmarkDateSummary[]> => {
    const rows = await fetchBookmarkDateSummaries()
    return mapBookmarkDateSummaryList(rows)
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const listState = useAsyncData(listFactory, { keepPreviousData: true })
  const dateSummariesState = useAsyncData(dateSummariesFactory)

  const selectDate = useCallback((date: string) => { setFilterDate(date) }, [])
  const clearDateFilter = useCallback(() => { setFilterDate(null) }, [])

  const changeSortOrder = useCallback((next: BookmarkSortOrder) => { setSortOrder(next) }, [])
  const goToPage = useCallback((next: number) => { setPage(next) }, [])

  return {
    // 목록
    items: listState.data?.items ?? [],
    totalPages: listState.data?.totalPages ?? 0,
    page,
    sortOrder,
    changeSortOrder,
    goToPage,
    initialLoading: listState.loading && listState.data == null,
    refreshing: listState.refreshing,
    error: listState.error,
    // 날짜 필터
    filterDate,
    selectDate,
    clearDateFilter,
    // 달력
    dateSummaries: dateSummariesState.data ?? [],
    dateSummariesLoading: dateSummariesState.loading && dateSummariesState.data == null,
  }
}
