import clsx from 'clsx'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { DashboardAiBrief } from '../components/dashboard/DashboardAiBrief'
import { DashboardAlertCards } from '../components/dashboard/DashboardAlertCards'
import { BuzzSurgeTop3 } from '../components/dashboard/BuzzSurgeTop3'
import { DashboardKospiChip } from '../components/dashboard/DashboardKospiChip'
import { DashboardWatchlistSection } from '../components/dashboard/DashboardWatchlistSection'
import { SectorHeatmapGrid } from '../components/dashboard/SectorHeatmapGrid'
import { PortfolioSentimentGauge } from '../components/dashboard/PortfolioSentimentGauge'
import { resolveDashboardAiBrief } from '../components/dashboard/buildDashboardAiBrief'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Card } from '../components/common/Card'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useDashboardBriefing } from '../hooks/useDashboardBriefing'
import { useDashboardOverview } from '../hooks/useDashboardOverview'
import { useAuthStore } from '../store/authStore'
import skeleton from '../components/common/Skeleton.module.css'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { data, loading, error } = useDashboardOverview()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const { data: briefing } = useDashboardBriefing(isLoggedIn)

  const aiBrief = useMemo(() => {
    if (!data) return ''
    return resolveDashboardAiBrief(briefing, data, { isLoggedIn })
  }, [briefing, data, isLoggedIn])

  const marketAsideRef = useRef<HTMLDivElement>(null)
  const [marketAsideHeight, setMarketAsideHeight] = useState(0)

  useLayoutEffect(() => {
    const el = marketAsideRef.current
    if (!el) return

    const sync = () => {
      setMarketAsideHeight(Math.floor(el.getBoundingClientRect().height))
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
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
          <div className={styles.skeletonStack} aria-busy="true" aria-label="대시보드 로딩">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padding="lg" className={styles.skeletonCard}>
                <div className={clsx(skeleton.block, skeleton.stat)} />
              </Card>
            ))}
          </div>
        ) : null}

        {data ? (
          <>
            <section className={styles.aiBriefSection} aria-label="오늘 시장 요약">
              <DashboardAiBrief
                summary={aiBrief}
                updatedAt={briefing?.updatedAt ?? null}
                showLoginAction={!isLoggedIn}
              />
            </section>

            {isLoggedIn ? (
              <section className={styles.heroGrid} aria-label="포트폴리오·이상치">
                <PortfolioSentimentGauge gauge={data.portfolioSentiment} className={styles.heroGauge} />
                <DashboardAlertCards
                  watchlist={data.watchlist}
                  marketOutlierRows={data.marketOutlierRows}
                  sectorHeatmap={data.sectorHeatmap}
                  isLoggedIn={isLoggedIn}
                />
              </section>
            ) : (
              <section className={styles.guestAlertSection} aria-label="오늘 이상치">
                <DashboardAlertCards
                  watchlist={data.watchlist}
                  marketOutlierRows={data.marketOutlierRows}
                  sectorHeatmap={data.sectorHeatmap}
                  isLoggedIn={isLoggedIn}
                />
              </section>
            )}

            {isLoggedIn ? (
              <section className={styles.watchlistSection} aria-label="관심 종목">
                <DashboardWatchlistSection rows={data.watchlist} />
              </section>
            ) : null}

            <section className={styles.marketSection} aria-label="KOSPI·언급량·섹터">
              <div ref={marketAsideRef} className={styles.marketAside}>
                <DashboardKospiChip gauge={data.kospiSentiment} />
                <BuzzSurgeTop3 items={data.buzzSurgeTop3} />
              </div>
              <div
                className={styles.heatmapWrap}
                style={marketAsideHeight > 0 ? { height: marketAsideHeight } : undefined}
              >
                <SectorHeatmapGrid cells={data.sectorHeatmap} />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </Layout>
  )
}
