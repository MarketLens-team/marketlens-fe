import clsx from 'clsx'
import { useState } from 'react'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { EmptyState } from '../components/common/EmptyState'
import { FeedLoadingSpinner } from '../components/common/FeedLoadingSpinner'
import { BackToTopButton } from '../components/common/BackToTopButton'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { AllNewsListItem } from '../components/news/AllNewsListItem'
import { NewsFeedModeTabs } from '../components/news/NewsFeedModeTabs'
import { StockTodayNewsSidebar } from '../components/news/StockTodayNewsSidebar'
import { DashboardLoginPrompt } from '../components/dashboard/DashboardLoginPrompt'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useNewsFeedFocus } from '../hooks/useNewsFeedFocus'
import { useNewsFeedPage, type NewsFeedMode } from '../hooks/useNewsFeedPage'
import { useTodayNewsStocks } from '../hooks/useTodayNewsStocks'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import styles from './NewsFeedPage.module.css'

export default function NewsFeedPage() {
  const [mode, setMode] = useState<NewsFeedMode>('all')
  const todayNews = useTodayNewsStocks()
  const { items, pagination, loading, loadingMore, error, loadMoreError, loadMore, needsLogin } =
    useNewsFeedPage(mode)

  const { isNewsFocused } = useNewsFeedFocus(items, {
    loading: loading && items.length === 0,
    hasMore: pagination.hasNext,
    loadingMore,
    onLoadMore: loadMore,
  })

  const newsSentinelRef = useInfiniteScroll({
    enabled: !loading && !needsLogin && items.length > 0,
    hasMore: pagination.hasNext,
    loading: loadingMore,
    onLoadMore: loadMore,
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
                <ul className={styles.list}>
                  {items.map((item) => (
                    <AllNewsListItem
                      key={item.id}
                      item={item}
                      highlighted={isNewsFocused(item.id)}
                    />
                  ))}
                </ul>
                {pagination.hasNext ? (
                  <div className={styles.scrollFoot}>
                    <div ref={newsSentinelRef} className={styles.sentinel} aria-hidden />
                    {loadingMore ? <FeedLoadingSpinner /> : null}
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

          <aside className={styles.fabRail} aria-label="페이지 탐색">
            <BackToTopButton placement="inline" tooltipSide="left" />
          </aside>
        </div>
      </div>
    </Layout>
  )
}
