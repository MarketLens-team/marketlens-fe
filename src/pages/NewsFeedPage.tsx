import clsx from 'clsx'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { EmptyState } from '../components/common/EmptyState'
import { FeedLoadingSpinner } from '../components/common/FeedLoadingSpinner'
import { PageFabRail } from '../components/common/PageFabRail'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { AllNewsListItem } from '../components/news/AllNewsListItem'
import { NewsFeedModeTabs } from '../components/news/NewsFeedModeTabs'
import { StockTodayNewsSidebar } from '../components/news/StockTodayNewsSidebar'
import { DashboardLoginPrompt } from '../components/dashboard/DashboardLoginPrompt'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { readNewsFeedSessionModeHint } from '../lib/newsFeedSession'
import { ANCHORED_SCROLL_PREFETCH_EDGE_PX } from '../data/types/anchoredFeed'
import { useNewsFeedFocus } from '../hooks/useNewsFeedFocus'
import { useNewsFeedPage, type NewsFeedMode } from '../hooks/useNewsFeedPage'
import { useTodayNewsStocks } from '../hooks/useTodayNewsStocks'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import styles from './NewsFeedPage.module.css'

export default function NewsFeedPage() {
  const [searchParams] = useSearchParams()
  const sessionModeHint = useMemo(() => readNewsFeedSessionModeHint(), [searchParams])
  const [mode, setMode] = useState<NewsFeedMode>(() => sessionModeHint ?? 'all')
  const todayNews = useTodayNewsStocks()
  const {
    items,
    feedMode,
    pagination,
    loading,
    loadingMore,
    loadingNewer,
    error,
    loadMoreError,
    loadMore,
    loadNewer,
    needsLogin,
    restoredScrollTop,
    feedReady,
    hasMoreDown,
    hasMoreUp,
  } = useNewsFeedPage(mode)

  const { isNewsFocused } = useNewsFeedFocus(items, {
    loading: loading && items.length === 0,
    hasMore: feedMode === 'latest' && pagination.hasNext,
    loadingMore: feedMode === 'latest' ? loadingMore : undefined,
    onLoadMore: feedMode === 'latest' ? loadMore : undefined,
    restoredScrollTop,
  })

  const anchoredEdgeMargin = `${ANCHORED_SCROLL_PREFETCH_EDGE_PX}px 0px 0px 0px`

  const newsTopSentinelRef = useInfiniteScroll({
    enabled: feedMode === 'anchored' && items.length > 0 && !needsLogin && feedReady,
    hasMore: hasMoreUp,
    loading: loadingNewer,
    direction: 'up',
    rootMargin: anchoredEdgeMargin,
    onLoadMore: () => void loadNewer(),
  })

  const newsSentinelRef = useInfiniteScroll({
    enabled: !loading && !needsLogin && items.length > 0 && feedReady,
    hasMore: hasMoreDown,
    loading: loadingMore,
    rootMargin: feedMode === 'anchored' ? `0px 0px ${ANCHORED_SCROLL_PREFETCH_EDGE_PX}px 0px` : undefined,
    onLoadMore: () => void loadMore(),
  })

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(new Error(error)) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  const showSkeleton = loading && items.length === 0 && !error && !needsLogin
  const feedTitle = mode === 'watchlist' ? '관심종목 뉴스' : '전체 뉴스'
  const emptyTitle =
    mode === 'watchlist' ? '관심종목 뉴스가 없어요' : '뉴스가 없어요'
  const emptyMessage =
    mode === 'watchlist'
      ? '관심 등록한 종목과 연결된 기사가 없습니다.'
      : '표시할 기사가 없습니다.'

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.layout}>
          <StockTodayNewsSidebar
            className={styles.sidebar}
            items={todayNews.items}
            loading={todayNews.loading}
            error={todayNews.error}
          />

          <div className={styles.main}>
            <NewsFeedModeTabs mode={mode} onModeChange={setMode} className={styles.tabs} />

            {error ? (
              <PageFetchError
                title={
                  mode === 'watchlist'
                    ? '관심종목 뉴스를 불러오지 못했어요'
                    : '전체 뉴스를 불러오지 못했어요'
                }
                message={error}
              />
            ) : null}

            {needsLogin ? (
              <DashboardLoginPrompt
                className={styles.loginPrompt}
                title="로그인이 필요해요"
                message="로그인하면 관심종목 뉴스 피드를 확인할 수 있어요."
              />
            ) : null}

            {showSkeleton ? (
              <div className={styles.skeletonList} aria-busy="true" aria-label={`${feedTitle} 로딩`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={clsx(skeleton.block, styles.skeletonRow)} />
                ))}
              </div>
            ) : null}

            {!loading && !error && !needsLogin && items.length === 0 ? (
              <EmptyState
                className={styles.empty}
                title={emptyTitle}
                message={emptyMessage}
                hint="잠시 후 다시 확인해 보세요."
              />
            ) : null}

            {!loading && !needsLogin && items.length > 0 ? (
              <section className={styles.feed} aria-label="뉴스 목록">
                <ul className={styles.list} data-anchored-feed-list>
                  {feedMode === 'anchored' && hasMoreUp ? (
                    <li className={styles.scrollHead} aria-hidden>
                      <div ref={newsTopSentinelRef} className={styles.sentinel} />
                    </li>
                  ) : null}
                  {items.map((item) => (
                    <AllNewsListItem
                      key={item.id}
                      item={item}
                      highlighted={isNewsFocused(item.id)}
                    />
                  ))}
                </ul>
                {hasMoreDown ? (
                  <div className={styles.scrollFoot} aria-busy={loadingMore || undefined}>
                    <div ref={newsSentinelRef} className={styles.sentinel} aria-hidden />
                    {loadingMore ? <FeedLoadingSpinner label="뉴스 더 불러오는 중" /> : null}
                  </div>
                ) : null}
                {loadMoreError ? (
                  <p className={styles.loadMoreError} role="alert">
                    {loadMoreError}
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>

        </div>
        <PageFabRail />
      </div>
    </Layout>
  )
}
