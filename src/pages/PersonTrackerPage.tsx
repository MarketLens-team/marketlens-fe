import clsx from 'clsx'
import { useState } from 'react'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { PageFabRail } from '../components/common/PageFabRail'
import { Layout } from '../components/common/Layout'
import { FeedLoadingSpinner } from '../components/common/FeedLoadingSpinner'
import { PageFetchError } from '../components/common/PageFetchError'
import { PersonStatementCard } from '../components/person/PersonStatementCard'
import type { PersonMentionsRange } from '../data/types/person'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { isPersonTrackerPageLoading } from '../lib/personPageLoading'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { usePersonFrequentStocks } from '../hooks/usePersonFrequentStocks'
import { usePersonTopMentioned } from '../hooks/usePersonTopMentioned'
import { usePersonStatementFocus } from '../hooks/usePersonStatementFocus'
import { usePersonTracker } from '../hooks/usePersonTracker'
import { PersonTrackerLeftSidebar, PersonTrackerRightSidebar } from './PersonDetailSidebars'
import gridStyles from './personPageLayout.module.css'
import styles from './PersonTrackerPage.module.css'

export default function PersonTrackerPage() {
  const feedRange: PersonMentionsRange = 'today'
  const [topRange, setTopRange] = useState<PersonMentionsRange>('today')
  const [stocksRange, setStocksRange] = useState<PersonMentionsRange>('today')

  const {
    data: feed,
    isInitialLoading: feedInitialLoading,
    error: feedError,
    loadMoreMentions,
    loadingMoreMentions,
  } = usePersonTracker(feedRange)
  const { data: topPersons, loading: topLoading } = usePersonTopMentioned(topRange)
  const { data: frequentStocks, loading: stocksLoading } = usePersonFrequentStocks(stocksRange)
  const topSidebarInitialLoading = topLoading && topPersons == null
  const stocksSidebarInitialLoading = stocksLoading && frequentStocks == null

  const pageLoading = isPersonTrackerPageLoading({
    feedError,
    feedInitialLoading,
    topLoading,
    topPersons,
    stocksLoading,
    frequentStocks,
  })

  const pageReady = !pageLoading && feed != null

  const { isStatementFocused } = usePersonStatementFocus(feed?.mentions ?? [], {
    loading: feedInitialLoading,
  })

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

  return (
    <Layout>
      <div className={styles.page} aria-busy={pageLoading || undefined}>
        {feedError ? (
          <PageFetchError title="인물 발언을 불러오지 못했어요" message={feedError.message} />
        ) : null}

        {pageReady ? (
          <div className={gridStyles.mainGrid}>
            <PersonTrackerLeftSidebar
              items={topPersons ?? []}
              range={topRange}
              onRangeChange={setTopRange}
              showInitialLoading={topSidebarInitialLoading}
            />

            <div className={gridStyles.feedCol}>
              <ul className={clsx(gridStyles.feedList, feedInitialLoading && styles.feedDimmed)}>
                {feed.mentions.map((mention) => (
                  <li
                    key={mention.id}
                    id={`person-statement-${mention.id}`}
                    data-scroll-anchor-item
                    className={gridStyles.timelineItem}
                  >
                    <PersonStatementCard
                      mention={mention}
                      highlighted={isStatementFocused(mention.id)}
                    />
                  </li>
                ))}
              </ul>
              {feed.mentions.length === 0 ? (
                <p className={styles.empty}>표시할 인물 발언이 없습니다</p>
              ) : null}
              {infiniteEnabled ? (
                <div className={styles.feedScrollFoot} aria-busy={loadingMoreMentions || undefined}>
                  <div ref={sentinelRef} className={styles.infiniteSentinel} aria-hidden />
                  {loadingMoreMentions ? (
                    <FeedLoadingSpinner label="발언 더 불러오는 중" />
                  ) : null}
                </div>
              ) : null}
            </div>

            <PersonTrackerRightSidebar
              items={frequentStocks ?? []}
              range={stocksRange}
              onRangeChange={setStocksRange}
              showInitialLoading={stocksSidebarInitialLoading}
            />

          </div>
        ) : null}

        {pageReady ? <PageFabRail /> : null}
      </div>
    </Layout>
  )
}
