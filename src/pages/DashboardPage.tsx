import clsx from 'clsx'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { BuzzSurgeTop3 } from '../components/dashboard/BuzzSurgeTop3'
import { DashboardWatchlistTable } from '../components/dashboard/DashboardWatchlistTable'
import { SectorHeatmapGrid } from '../components/dashboard/SectorHeatmapGrid'
import { PortfolioSentimentGauge } from '../components/dashboard/PortfolioSentimentGauge'
import { SentimentGaugePanel } from '../components/dashboard/SentimentGaugePanel'
import { Card } from '../components/common/Card'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import { useDashboardOverview } from '../hooks/useDashboardOverview'
import skeleton from '../components/common/Skeleton.module.css'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { data, loading, error } = useDashboardOverview()
  const leftAsideRef = useRef<HTMLDivElement>(null)
  const [leftAsideHeight, setLeftAsideHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = leftAsideRef.current
    if (!el) return

    const syncHeight = () => setLeftAsideHeight(el.offsetHeight)
    const observer = new ResizeObserver(syncHeight)
    observer.observe(el)
    syncHeight()

    return () => observer.disconnect()
  }, [data])

  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader title="홈" description="포트폴리오 감성·관심 종목을 한 화면에서 봅니다. (목 데이터)" align="center" />
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
            <section
              className={styles.topGrid}
              aria-label="포트폴리오·언급량·관심 종목"
              style={
                leftAsideHeight != null
                  ? ({ '--top-row-h': `${leftAsideHeight}px` } as CSSProperties)
                  : undefined
              }
            >
              <div ref={leftAsideRef} className={styles.leftAside}>
                <PortfolioSentimentGauge gauge={data.portfolioSentiment} />
                <BuzzSurgeTop3 items={data.buzzSurgeTop3} />
              </div>
              <DashboardWatchlistTable rows={data.watchlist} className={styles.watchlistMain} />
            </section>

            <section className={styles.marketSection} aria-label="KOSPI·섹터 감성">
              <div className={styles.marketGrid}>
                <SentimentGaugePanel
                  title="KOSPI 종합"
                  subtitle="참고용"
                  gauge={data.kospiSentiment}
                />
                <SectorHeatmapGrid cells={data.sectorHeatmap} />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </Layout>
  )
}
