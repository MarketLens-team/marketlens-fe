import clsx from 'clsx'
import { useCallback, useState } from 'react'
import { MyPageAccountInfo } from '../components/mypage/MyPageAccountInfo'
import { MyPageAlertSettings } from '../components/mypage/MyPageAlertSettings'
import { MyPageSummaryCards } from '../components/mypage/MyPageSummaryCards'
import { MyPageWatchlistTable } from '../components/mypage/MyPageWatchlistTable'
import { Layout } from '../components/common/Layout'
import skeleton from '../components/common/Skeleton.module.css'
import { updateAlertSettings } from '../data/clients/memberClient'
import { fetchMyPage } from '../data/clients/myPageClient'
import { removeWatchlistItem } from '../data/clients/watchlistClient'
import type { AlertSettings } from '../data/types/member'
import { useAsyncData } from '../hooks/useAsyncData'
import styles from './MyPage.module.css'

export default function MyPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [removingCode, setRemovingCode] = useState<string | null>(null)
  const [savingAlerts, setSavingAlerts] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const factory = useCallback(() => fetchMyPage(), [refreshKey])
  const { data, loading, error } = useAsyncData(factory)

  const [localSettings, setLocalSettings] = useState<AlertSettings | null>(null)
  const alertSettings = localSettings ?? data?.alertSettings

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

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <p className={styles.bannerError} role="alert">
            {error.message}
          </p>
        ) : null}
        {actionError ? (
          <p className={styles.bannerError} role="alert">
            {actionError}
          </p>
        ) : null}

        {loading && !data ? (
          <div aria-busy="true" aria-label="마이페이지 로딩">
            <div className={styles.summarySkeleton}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, styles.skeletonSummaryCard)} />
              ))}
            </div>
            <div className={styles.mainGrid}>
              <div className={clsx(skeleton.block, styles.skeletonTable)} />
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
