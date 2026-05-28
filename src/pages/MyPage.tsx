import clsx from 'clsx'
import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MyPageAccountInfo } from '../components/mypage/MyPageAccountInfo'
import { MyPageAlertSettings } from '../components/mypage/MyPageAlertSettings'
import { MyPageSummaryCards } from '../components/mypage/MyPageSummaryCards'
import { MyPageBookmarkSection } from '../components/mypage/MyPageBookmarkSection'
import { MyPageWatchlistTable } from '../components/mypage/MyPageWatchlistTable'
import { ProfileLayout } from '../components/mypage/ProfileLayout'
import { ProfileSideNav } from '../components/mypage/ProfileSideNav'
import { parseMyPageTab, type MyPageTab } from '../components/mypage/profileTabs'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { removeNewsBookmark } from '../data/clients/bookmarkClient'
import { updateAlertSettings } from '../data/clients/memberClient'
import { fetchMyPage } from '../data/clients/myPageClient'
import { removeWatchlistItem } from '../data/clients/watchlistClient'
import type { AlertSettings } from '../data/types/member'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useAsyncData } from '../hooks/useAsyncData'
import { useMyPageBookmarks } from '../hooks/useMyPageBookmarks'
import styles from './MyPage.module.css'

export default function MyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseMyPageTab(searchParams.get('tab'))

  const [refreshKey, setRefreshKey] = useState(0)
  const [bookmarkRefreshKey] = useState(0)
  const [savingAlerts, setSavingAlerts] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const factory = useCallback(() => fetchMyPage(), [refreshKey])
  const { data, loading, error } = useAsyncData(factory, { keepPreviousData: true })

  const {
    items: bookmarkItems,
    totalPages: bookmarkTotalPages,
    page: bookmarkPage,
    sortOrder: bookmarkSortOrder,
    changeSortOrder: changeBookmarkSortOrder,
    goToPage: goToBookmarkPage,
    initialLoading: bookmarkInitialLoading,
    refreshing: bookmarkRefreshing,
    error: bookmarksError,
    filterDate: bookmarkFilterDate,
    selectDate: selectBookmarkDate,
    clearDateFilter: clearBookmarkDateFilter,
    dateSummaries: bookmarkDateSummaries,
    dateSummariesLoading: bookmarkDateSummariesLoading,
  } = useMyPageBookmarks(bookmarkRefreshKey)

  const [localSettings, setLocalSettings] = useState<AlertSettings | null>(null)
  const alertSettings = localSettings ?? data?.alertSettings

  const handleTabChange = (next: MyPageTab) => {
    const nextParams = new URLSearchParams(searchParams)
    if (next === 'watchlist') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setSearchParams(nextParams, { replace: true })
  }

  const handleBookmarkRemove = (newsId: string) => {
    // UI는 낙관적 삭제(컴포넌트 로컬) — API는 fire-and-forget
    removeNewsBookmark(newsId).catch(() => {
      // 실패해도 UI에서 별도 표시 없음 (페이지 재방문 시 복원됨)
    })
  }

  const handleRemove = (code: string) => {
    // UI는 낙관적 삭제(컴포넌트 로컬) — API는 fire-and-forget
    // API 성공 후 데이터 재조회로 카운트 등 갱신 (keepPreviousData: true로 플래시 없음)
    removeWatchlistItem(code).then(() => {
      setLocalSettings(null)
      setRefreshKey((key) => key + 1)
    }).catch(() => {
      // 실패해도 UI에서 별도 표시 없음 (페이지 재방문 시 복원됨)
    })
  }

  const handleSettingsChange = async (next: AlertSettings) => {
    if (!data) return
    setActionError(null)
    setLocalSettings(next)
    setSavingAlerts(true)
    try {
      await updateAlertSettings(next)
    } catch (e) {
      setLocalSettings(data.alertSettings)
      setActionError(e instanceof Error ? e.message : '알림 설정 저장에 실패했습니다.')
    } finally {
      setSavingAlerts(false)
    }
  }

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(error) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <PageFetchError title="마이페이지를 불러오지 못했어요" message={error.message} />
        ) : null}
        {actionError ? (
          <PageFetchError title="작업에 실패했어요" message={actionError} />
        ) : null}

        {loading && !data && !error ? (
          <div aria-busy="true" aria-label="마이페이지 로딩">
            <div className={styles.summarySkeleton}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, styles.skeletonSummaryCard)} />
              ))}
            </div>
            <div className={styles.tabPanel}>
              <div className={clsx(skeleton.block, styles.skeletonTable)} />
            </div>
          </div>
        ) : null}

        {data && alertSettings ? (
          <ProfileLayout nav={<ProfileSideNav active={tab} onChange={handleTabChange} />}>
            {tab === 'watchlist' ? (
              <div className={styles.tabPanel}>
                <MyPageSummaryCards summary={data.summary} />
                <MyPageWatchlistTable
                  rows={data.watchlist}
                  onRemove={handleRemove}
                />
              </div>
            ) : null}

            {tab === 'account' ? (
              <div className={clsx(styles.tabPanel, styles.tabPanelSections)}>
                <MyPageAccountInfo account={data.account} />
                <hr className={styles.sectionDivider} aria-hidden />
                <MyPageAlertSettings
                  settings={alertSettings}
                  saving={savingAlerts}
                  onSettingsChange={handleSettingsChange}
                />
              </div>
            ) : null}

            {tab === 'news' ? (
              <div className={styles.tabPanel}>
                {bookmarksError ? (
                  <PageFetchError title="저장한 뉴스를 불러오지 못했어요" message={bookmarksError.message} />
                ) : (
                  <MyPageBookmarkSection
                    dateSummaries={bookmarkDateSummaries}
                    dateSummariesLoading={bookmarkDateSummariesLoading}
                    items={bookmarkItems}
                    totalPages={bookmarkTotalPages}
                    page={bookmarkPage}
                    sortOrder={bookmarkSortOrder}
                    initialLoading={bookmarkInitialLoading}
                    refreshing={bookmarkRefreshing}
                    onSortChange={changeBookmarkSortOrder}
                    onPageChange={goToBookmarkPage}
                    filterDate={bookmarkFilterDate}
                    onDateSelect={selectBookmarkDate}
                    onDateClear={clearBookmarkDateFilter}
                    onRemove={handleBookmarkRemove}
                  />
                )}
              </div>
            ) : null}
          </ProfileLayout>
        ) : null}
      </div>
    </Layout>
  )
}
