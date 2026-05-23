import clsx from 'clsx'
import { useState } from 'react'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { BackToTopButton } from '../components/common/BackToTopButton'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { PersonFrequentStocksPanel } from '../components/person/PersonFrequentStocksPanel'
import { PersonStatementCard } from '../components/person/PersonStatementCard'
import { PersonTop5Panel } from '../components/person/PersonTop5Panel'
import type { PersonMentionsRange } from '../data/types/person'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { usePersonFrequentStocks } from '../hooks/usePersonFrequentStocks'
import { usePersonTopMentioned } from '../hooks/usePersonTopMentioned'
import { usePersonTracker } from '../hooks/usePersonTracker'
import gridStyles from './personPageLayout.module.css'
import styles from './PersonTrackerPage.module.css'

export default function PersonTrackerPage() {
  const feedRange: PersonMentionsRange = 'today'
  const [topRange, setTopRange] = useState<PersonMentionsRange>('today')
  const [stocksRange, setStocksRange] = useState<PersonMentionsRange>('today')

  const {
    data: feed,
    loading: feedLoading,
    isInitialLoading: feedInitialLoading,
    error: feedError,
    loadMoreMentions,
    loadingMoreMentions,
  } = usePersonTracker(feedRange)
  const {
    data: topPersons,
    loading: topLoading,
    refreshing: topRefreshing,
  } = usePersonTopMentioned(topRange)
  const {
    data: frequentStocks,
    loading: stocksLoading,
    refreshing: stocksRefreshing,
  } = usePersonFrequentStocks(stocksRange)

  const infiniteEnabled = Boolean(feed?.mentionsHasNext)
  const sentinelRef = useInfiniteScroll({
    enabled: infiniteEnabled,
    hasMore: Boolean(feed?.mentionsHasNext),
    loading: loadingMoreMentions,
    onLoadMore: () => void loadMoreMentions(),
  })

  const httpFullscreenPreset = feedError ? fullscreenPresetFromAppError(feedError) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  const showInitialSkeleton = feedInitialLoading && !feedError

  return (
    <Layout>
      <div className={styles.page}>
        {feedError ? (
          <PageFetchError title="인물 발언을 불러오지 못했어요" message={feedError.message} />
        ) : null}

        {showInitialSkeleton ? (
          <div className={gridStyles.mainGrid} aria-busy="true" aria-label="인물 발언 로딩">
            <aside className={clsx(gridStyles.leftAside, gridStyles.sideSticky)}>
              <div className={clsx(skeleton.block, styles.skeletonAside)} />
            </aside>
            <div className={gridStyles.feedCol}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, styles.skeletonCard)} />
              ))}
            </div>
            <aside className={clsx(gridStyles.rightAside, gridStyles.sideSticky)}>
              <div className={clsx(skeleton.block, styles.skeletonAside)} />
            </aside>
          </div>
        ) : null}

        {feed ? (
          <div className={gridStyles.mainGrid}>
            <aside className={clsx(gridStyles.leftAside, gridStyles.sideSticky)}>
              <PersonTop5Panel
                items={topPersons ?? []}
                range={topRange}
                onRangeChange={setTopRange}
                loading={topLoading || topRefreshing}
              />
            </aside>

            <div className={gridStyles.feedCol}>
              <ul className={clsx(gridStyles.feedList, feedLoading && styles.feedDimmed)}>
                {feed.mentions.map((mention) => (
                  <li key={mention.id} className={gridStyles.timelineItem}>
                    <PersonStatementCard mention={mention} />
                  </li>
                ))}
              </ul>
              {feed.mentions.length === 0 ? (
                <p className={styles.empty}>표시할 인물 발언이 없습니다</p>
              ) : null}
              {infiniteEnabled ? <div ref={sentinelRef} className={styles.infiniteSentinel} aria-hidden /> : null}
            </div>

            <aside className={clsx(gridStyles.rightAside, gridStyles.sideSticky)}>
              <PersonFrequentStocksPanel
                items={frequentStocks ?? []}
                range={stocksRange}
                onRangeChange={setStocksRange}
                loading={stocksLoading || stocksRefreshing}
              />
            </aside>
          </div>
        ) : null}

        {feed ? <BackToTopButton placement="fixed" tooltipSide="left" /> : null}
      </div>
    </Layout>
  )
}
