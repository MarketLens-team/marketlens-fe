import clsx from 'clsx'
import { CardSectionHeader } from '../components/common/CardSectionHeader'
import { Card } from '../components/common/Card'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import skeleton from '../components/common/Skeleton.module.css'
import { useAdminCrawlingLogs } from '../hooks/useAdminCrawlingLogs'
import type { CrawlingLogStatus } from '../data/types/admin'
import styles from './AdminCrawlingPage.module.css'

function statusBadgeClass(status: CrawlingLogStatus, endedAt: string | null) {
  if (!endedAt) return styles.stRun
  if (status === 'SUCCESS') return styles.stOk
  if (status === 'FAIL') return styles.stFail
  return styles.stPartial
}

function statusLabel(status: CrawlingLogStatus, endedAt: string | null) {
  if (!endedAt) return '진행 중'
  return status
}

export default function AdminCrawlingPage() {
  const { data, loading, error } = useAdminCrawlingLogs()

  return (
    <Layout hideSidebar={false}>
      <div className={styles.page}>
        <PageHeader
          title="크롤링 로그"
          description="`crawling_log` 실행 이력. GET /api/v1/admin/crawling/logs"
        />
        {error ? (
          <p className={styles.bannerError} role="alert">
            {error.message}
          </p>
        ) : null}
        <Card padding="none" className={styles.feedCard}>
          <CardSectionHeader
            title="실행 이력"
            subtitle="상태 · 시도/성공/실패 · 시작 · 종료"
          />
          {loading && !data ? (
            <div className={styles.skeletonList} aria-busy="true" aria-label="크롤링 로그 로딩">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, skeleton.rowLg)} />
              ))}
            </div>
          ) : (data ?? []).length === 0 ? (
            <p className={skeleton.empty}>크롤링 로그가 없습니다</p>
          ) : (
            <ul className={styles.list}>
              {(data ?? []).map((log) => (
                <li key={log.crawlingLogId} className={styles.item}>
                  <div className={styles.row}>
                    <p className={styles.name}>로그 #{log.crawlingLogId}</p>
                    <span className={statusBadgeClass(log.status, log.endedAt)}>
                      {statusLabel(log.status, log.endedAt)}
                    </span>
                  </div>
                  {log.errorMessage ? <p className={styles.msg}>{log.errorMessage}</p> : null}
                  <dl className={styles.counts}>
                    <div>
                      <dt>시도</dt>
                      <dd>{log.totalCount}</dd>
                    </div>
                    <div>
                      <dt>성공</dt>
                      <dd>{log.successCount}</dd>
                    </div>
                    <div>
                      <dt>실패</dt>
                      <dd>{log.failCount}</dd>
                    </div>
                  </dl>
                  <dl className={styles.dl}>
                    <div>
                      <dt>시작</dt>
                      <dd>{new Date(log.startedAt).toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt>종료</dt>
                      <dd>{log.endedAt ? new Date(log.endedAt).toLocaleString() : '—'}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Layout>
  )
}
