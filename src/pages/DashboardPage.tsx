import clsx from 'clsx'
import { BuzzSurgeTop3 } from '../components/dashboard/BuzzSurgeTop3'
import { DashboardWatchlistTable } from '../components/dashboard/DashboardWatchlistTable'
import { SectorHeatmapGrid } from '../components/dashboard/SectorHeatmapGrid'
import { SentimentGaugePanel } from '../components/dashboard/SentimentGaugePanel'
import { Card } from '../components/common/Card'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import { useDashboardOverview } from '../hooks/useDashboardOverview'
import skeleton from '../components/common/Skeleton.module.css'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { data, loading, error } = useDashboardOverview()

  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader
          title="홈"
          description="포트폴리오 감성·관심 종목·시장 컨텍스트를 한 화면에서 봅니다. (목 데이터)"
          align="center"
        />
        {error ? (
          <p className={styles.bannerError} role="alert">
            {error.message}
          </p>
        ) : null}

        {loading && !data ? (
          <div className={styles.skeletonGrid} aria-busy="true" aria-label="대시보드 로딩">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="lg">
                <div className={clsx(skeleton.block, skeleton.stat)} />
              </Card>
            ))}
          </div>
        ) : null}

        {data ? (
          <>
            <section className={styles.topGrid} aria-label="포트폴리오·관심 종목">
              <SentimentGaugePanel
                title="내 포트폴리오 감성"
                gauge={data.portfolioSentiment}
                stocksToWatch={data.stocksToWatch}
              />
              <DashboardWatchlistTable rows={data.watchlist} />
            </section>

            <section className={styles.marketSection} aria-label="시장 전체 컨텍스트">
              <h2 className={styles.marketTitle}>시장 전체 컨텍스트</h2>
              <div className={styles.marketGrid}>
                <SentimentGaugePanel
                  title="KOSPI 종합"
                  subtitle="참고용"
                  gauge={data.kospiSentiment}
                />
                <BuzzSurgeTop3 items={data.buzzSurgeTop3} />
                <SectorHeatmapGrid cells={data.sectorHeatmap} />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </Layout>
  )
}
