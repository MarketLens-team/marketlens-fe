import clsx from 'clsx'
import { Card } from '../components/common/Card'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import skeleton from '../components/common/Skeleton.module.css'
import { StatTile } from '../components/common/StatTile'
import { useAdminOverview } from '../hooks/useAdminOverview'
import styles from './AdminPage.module.css'

export default function AdminPage() {
  const { data, loading, error } = useAdminOverview()

  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader
          title="관리자"
          description="`stock`·`crawling_log` 기준 집계 요약. GET /api/v1/admin/overview"
        />
        {error ? (
          <p className={styles.bannerError} role="alert">
            {error.message}
          </p>
        ) : null}
        <section className={styles.stats} aria-label="운영 지표">
          {loading && !data
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} padding="md">
                  <div className={clsx(skeleton.block, skeleton.stat)} aria-hidden />
                </Card>
              ))
            : data
              ? (
                  <>
                    <Card padding="md">
                      <StatTile label="등록 종목" value={String(data.totalStocks)} hint="활성 파이프라인 기준" />
                    </Card>
                    <Card padding="md">
                      <StatTile
                        label="오늘 크롤 실행"
                        value={String(data.crawlingRunsToday)}
                        hint="crawling_log 시작일 기준"
                      />
                    </Card>
                    <Card padding="md">
                      <StatTile
                        label="24h 실패"
                        value={String(data.failedRuns24h)}
                        hint="status = FAIL"
                      />
                    </Card>
                    <Card padding="md">
                      <StatTile
                        label="마지막 크롤 종료"
                        value={
                          data.lastCrawlEndedAt
                            ? new Date(data.lastCrawlEndedAt).toLocaleTimeString()
                            : '—'
                        }
                        hint={
                          data.lastCrawlEndedAt
                            ? new Date(data.lastCrawlEndedAt).toLocaleString()
                            : 'ended_at 없음'
                        }
                      />
                    </Card>
                  </>
                )
              : null}
        </section>
      </div>
    </Layout>
  )
}
