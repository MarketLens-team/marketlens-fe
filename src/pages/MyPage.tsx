import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MyPageAccountInfo } from '../components/mypage/MyPageAccountInfo'
import { MyPageAlertSettings } from '../components/mypage/MyPageAlertSettings'
import { MyPagePasswordChange } from '../components/mypage/MyPagePasswordChange'
import { MyPageTelegramLink } from '../components/mypage/MyPageTelegramLink'
import { MyPageSummaryCards } from '../components/mypage/MyPageSummaryCards'
import { MyPageBookmarkSection } from '../components/mypage/MyPageBookmarkSection'
import { MyPageWatchlistTable } from '../components/mypage/MyPageWatchlistTable'
import { ProfileLayout } from '../components/mypage/ProfileLayout'
import { ProfileSideNav } from '../components/mypage/ProfileSideNav'
import { parseMyPageTab, type MyPageTab } from '../components/mypage/profileTabs'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Card } from '../components/common/Card'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { Snackbar } from '../components/ui/Snackbar'
import skeleton from '../components/common/Skeleton.module.css'
import { removeNewsBookmark } from '../data/clients/bookmarkClient'
import { updateAlertSettings } from '../data/clients/memberClient'
import { fetchMyPage } from '../data/clients/myPageClient'
import { removeWatchlistItem } from '../data/clients/watchlistClient'
import type { AlertSettings } from '../data/types/member'
import type { MyPageBookmarkItem } from '../data/types/myPage'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useAsyncData } from '../hooks/useAsyncData'
import { useMyPageBookmarks } from '../hooks/useMyPageBookmarks'
import { useTransientSnackbar } from '../hooks/useTransientSnackbar'
import styles from './MyPage.module.css'

const UNDO_WINDOW_MS = 2800

export default function MyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseMyPageTab(searchParams.get('tab'))

  const [refreshKey, setRefreshKey] = useState(0)
  const [bookmarkRefreshKey, setBookmarkRefreshKey] = useState(0)
  const [savingAlerts, setSavingAlerts] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const snackbar = useTransientSnackbar()
  const pendingWatchlistRemoveRef = useRef<Map<string, number>>(new Map())
  const pendingBookmarkRemoveRef = useRef<Map<string, number>>(new Map())

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

  useEffect(() => {
    return () => {
      pendingWatchlistRemoveRef.current.forEach((timerId) => window.clearTimeout(timerId))
      pendingWatchlistRemoveRef.current.clear()
      pendingBookmarkRemoveRef.current.forEach((timerId) => window.clearTimeout(timerId))
      pendingBookmarkRemoveRef.current.clear()
    }
  }, [])

  const handleBookmarkRemove = (
    item: MyPageBookmarkItem,
    controls: { restore: () => void },
  ) => {
    if (pendingBookmarkRemoveRef.current.has(item.id)) return

    const timerId = window.setTimeout(() => {
      pendingBookmarkRemoveRef.current.delete(item.id)
      removeNewsBookmark(item.id)
        .then(() => {
          setBookmarkRefreshKey((key) => key + 1)
        })
        .catch(() => {
          setBookmarkRefreshKey((key) => key + 1)
          snackbar.show('뉴스 저장 취소에 실패했습니다.')
        })
    }, UNDO_WINDOW_MS)

    pendingBookmarkRemoveRef.current.set(item.id, timerId)
    snackbar.show('뉴스 저장이 취소되었습니다.', {
      durationMs: UNDO_WINDOW_MS,
      action: {
        label: '되돌리기',
        onAction: () => {
          const pendingTimer = pendingBookmarkRemoveRef.current.get(item.id)
          if (pendingTimer != null) {
            window.clearTimeout(pendingTimer)
            pendingBookmarkRemoveRef.current.delete(item.id)
          }
          controls.restore()
          snackbar.show('뉴스 삭제가 취소되었습니다.')
        },
      },
    })
  }

  const handleRemove = (
    code: string,
    controls: { restore: () => void },
  ) => {
    if (pendingWatchlistRemoveRef.current.has(code)) return

    const timerId = window.setTimeout(() => {
      pendingWatchlistRemoveRef.current.delete(code)
      removeWatchlistItem(code)
        .then(() => {
          setLocalSettings(null)
          setRefreshKey((key) => key + 1)
        })
        .catch(() => {
          setRefreshKey((key) => key + 1)
          snackbar.show('종목 저장 취소에 실패했습니다.')
        })
    }, UNDO_WINDOW_MS)

    pendingWatchlistRemoveRef.current.set(code, timerId)
    snackbar.show('종목 저장이 취소되었습니다.', {
      durationMs: UNDO_WINDOW_MS,
      action: {
        label: '되돌리기',
        onAction: () => {
          const pendingTimer = pendingWatchlistRemoveRef.current.get(code)
          if (pendingTimer != null) {
            window.clearTimeout(pendingTimer)
            pendingWatchlistRemoveRef.current.delete(code)
          }
          controls.restore()
          snackbar.show('종목 삭제가 취소되었습니다.')
        },
      },
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

  const handleTelegramLinkOpened = () => {
    setActionError(null)
    snackbar.show('텔레그램 앱에서 봇 채팅의 시작(Start)을 눌러 연동을 완료해 주세요.', {
      durationMs: 6000,
    })
  }

  const handleAccountActionError = (message: string) => {
    setActionError(message)
  }

  const handlePasswordChangeSuccess = () => {
    setActionError(null)
    snackbar.show('비밀번호가 변경되었습니다.')
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
            <Card padding="md">
              <div className={styles.summarySkeleton}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={clsx(skeleton.block, skeleton.stat)} aria-hidden />
                ))}
              </div>
            </Card>
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
                <MyPageTelegramLink
                  onOpened={handleTelegramLinkOpened}
                  onError={handleAccountActionError}
                />
                <hr className={styles.sectionDivider} aria-hidden />
                <MyPagePasswordChange
                  email={data.account.email}
                  onSuccess={handlePasswordChangeSuccess}
                  onError={handleAccountActionError}
                />
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
        {snackbar.message ? (
          <Snackbar
            message={snackbar.message}
            actionLabel={snackbar.actionLabel}
            onAction={snackbar.onAction}
          />
        ) : null}
      </div>
    </Layout>
  )
}
