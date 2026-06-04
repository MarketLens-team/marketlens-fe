import clsx from 'clsx'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { BuzzSurgeTop3 } from '../components/dashboard/BuzzSurgeTop3'
import { DashboardWatchlistTable } from '../components/dashboard/DashboardWatchlistTable'
import { SectorHeatmapGrid } from '../components/dashboard/SectorHeatmapGrid'
import { PortfolioSentimentGauge } from '../components/dashboard/PortfolioSentimentGauge'
import { SentimentGaugePanel } from '../components/dashboard/SentimentGaugePanel'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Card } from '../components/common/Card'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
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

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(error) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <PageFetchError title="홈을 불러오지 못했어요" message={error.message} />
        ) : null}

        {loading && !data && !error ? (
          <div className={styles.skeletonGrid} aria-busy="true" aria-label="대시보드 로딩">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="lg" className={styles.skeletonCard}>
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
