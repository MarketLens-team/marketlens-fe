import clsx from 'clsx'
import { useCallback, useState } from 'react'
import { MyPageAccountInfo } from '../components/mypage/MyPageAccountInfo'
import { MyPageAlertSettings } from '../components/mypage/MyPageAlertSettings'
import { MyPageSummaryCards } from '../components/mypage/MyPageSummaryCards'
import { MyPageBookmarkList } from '../components/mypage/MyPageBookmarkList'
import { MyPageWatchlistTable } from '../components/mypage/MyPageWatchlistTable'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { fetchNewsBookmarks, removeNewsBookmark } from '../data/clients/bookmarkClient'
import { updateAlertSettings } from '../data/clients/memberClient'
import { fetchMyPage } from '../data/clients/myPageClient'
import { removeWatchlistItem } from '../data/clients/watchlistClient'
import { mapNewsBookmarkList } from '../data/mappers/bookmarkMapper'
import type { MyPageBookmarkItem } from '../data/types/myPage'
import type { AlertSettings } from '../data/types/member'
import { getApiErrorMessage } from '../data/util/apiError'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useAsyncData } from '../hooks/useAsyncData'
import styles from './MyPage.module.css'

export default function MyPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [bookmarkRefreshKey, setBookmarkRefreshKey] = useState(0)
  const [removingCode, setRemovingCode] = useState<string | null>(null)
  const [removingBookmarkId, setRemovingBookmarkId] = useState<string | null>(null)
  const [savingAlerts, setSavingAlerts] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const factory = useCallback(() => fetchMyPage(), [refreshKey])
  const { data, loading, error } = useAsyncData(factory)

  const bookmarkFactory = useCallback(async (): Promise<MyPageBookmarkItem[]> => {
    const rows = await fetchNewsBookmarks()
    return mapNewsBookmarkList(rows)
  }, [bookmarkRefreshKey])
  const {
    data: bookmarks,
    loading: bookmarksLoading,
    error: bookmarksError,
  } = useAsyncData(bookmarkFactory)

  const [localSettings, setLocalSettings] = useState<AlertSettings | null>(null)
  const alertSettings = localSettings ?? data?.alertSettings

  const handleBookmarkRemove = async (newsId: string) => {
    setActionError(null)
    setRemovingBookmarkId(newsId)
    try {
      await removeNewsBookmark(newsId)
      setBookmarkRefreshKey((key) => key + 1)
    } catch (e) {
      setActionError(getApiErrorMessage(e, '즐겨찾기 해제에 실패했습니다.'))
    } finally {
      setRemovingBookmarkId(null)
    }
  }

  const handleRemove = async (code: string) => {
    setActionError(null)
    setRemovingCode(code)
    try {
      await removeWatchlistItem(code)
      setLocalSettings(null)
      setRefreshKey((key) => key + 1)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '관심 종목 삭제에 실패했습니다.')
    } finally {
      setRemovingCode(null)
    }
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
            <div className={styles.mainGrid}>
              <div className={styles.mainCol}>
                <div className={clsx(skeleton.block, styles.skeletonTable)} />
                <div className={clsx(skeleton.block, styles.skeletonBookmarks)} />
              </div>
              <div className={styles.asideCol}>
                <div className={clsx(skeleton.block, styles.skeletonAside)} />
                <div className={clsx(skeleton.block, styles.skeletonAside)} />
              </div>
            </div>
          </div>
        ) : null}

        {data && alertSettings ? (
          <>
            <MyPageSummaryCards summary={data.summary} />
            <div className={styles.mainGrid}>
              <div className={styles.mainCol}>
                <MyPageWatchlistTable
                  rows={data.watchlist}
                  removingCode={removingCode}
                  onRemove={handleRemove}
                />
                {bookmarksError ? (
                  <PageFetchError
                    title="저장한 뉴스를 불러오지 못했어요"
                    message={bookmarksError.message}
                  />
                ) : null}
                {bookmarksLoading && !bookmarks && !bookmarksError ? (
                  <div
                    className={clsx(skeleton.block, styles.skeletonBookmarks)}
                    aria-busy="true"
                    aria-label="저장한 뉴스 로딩"
                  />
                ) : null}
                {bookmarks ? (
                  <MyPageBookmarkList
                    items={bookmarks}
                    removingId={removingBookmarkId}
                    onRemove={handleBookmarkRemove}
                  />
                ) : null}
              </div>
              <aside className={styles.asideCol}>
                <MyPageAlertSettings
                  settings={alertSettings}
                  alertExample={data.alertExample}
                  saving={savingAlerts}
                  onSettingsChange={handleSettingsChange}
                />
                <MyPageAccountInfo account={data.account} />
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  )
}
