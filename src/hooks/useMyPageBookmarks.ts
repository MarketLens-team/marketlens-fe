import { useCallback, useEffect, useState } from 'react'
import { fetchBookmarkDateSummaries, fetchNewsBookmarks } from '../data/clients/bookmarkClient'
import { mapBookmarkDateSummaryList, mapNewsBookmarkPage } from '../data/mappers/bookmarkMapper'
import type { BookmarkSortOrder } from '../data/types/bookmark'
import type { MyPageBookmarkDateSummary, MyPageBookmarkItem, MyPageBookmarkPage } from '../data/types/myPage'
import { useAsyncData } from './useAsyncData'

const PAGE_SIZE = 10

export function useMyPageBookmarks(refreshKey: number) {
  const [sortOrder, setSortOrder] = useState<BookmarkSortOrder>('LATEST')
  const [page, setPage] = useState(0)
  const [modalDate, setModalDate] = useState<string | null>(null)

  // sort·refreshKey 변경 시 페이지 리셋
  useEffect(() => { setPage(0) }, [sortOrder, refreshKey])

  // 삭제 후 모달 닫기
  useEffect(() => { setModalDate(null) }, [refreshKey])

  const listFactory = useCallback(async (): Promise<MyPageBookmarkPage> => {
    const raw = await fetchNewsBookmarks({ page, size: PAGE_SIZE, sortOrder })
    return mapNewsBookmarkPage(raw)
  }, [refreshKey, page, sortOrder]) // eslint-disable-line react-hooks/exhaustive-deps

  const dateSummariesFactory = useCallback(async (): Promise<MyPageBookmarkDateSummary[]> => {
    const rows = await fetchBookmarkDateSummaries()
    return mapBookmarkDateSummaryList(rows)
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const modalDateFactory = useCallback(async (): Promise<MyPageBookmarkItem[]> => {
    if (!modalDate) return []
    const raw = await fetchNewsBookmarks({ publishedDate: modalDate, size: 50, sortOrder: 'LATEST' })
    return mapNewsBookmarkPage(raw).items
  }, [modalDate, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const listState = useAsyncData(listFactory, { keepPreviousData: true })
  const dateSummariesState = useAsyncData(dateSummariesFactory)
  const modalDateState = useAsyncData(modalDateFactory, { enabled: modalDate != null })

  const openDateModal = useCallback((date: string) => { setModalDate(date) }, [])
  const closeDateModal = useCallback(() => { setModalDate(null) }, [])

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
    // 달력
    dateSummaries: dateSummariesState.data ?? [],
    dateSummariesLoading: dateSummariesState.loading && dateSummariesState.data == null,
    // 모달
    modalDate,
    modalItems: modalDateState.data ?? [],
    modalLoading: modalDate != null && modalDateState.loading,
    openDateModal,
    closeDateModal,
  }
}
