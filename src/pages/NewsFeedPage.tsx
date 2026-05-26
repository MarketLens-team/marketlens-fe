import clsx from 'clsx'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { EmptyState } from '../components/common/EmptyState'
import { FeedLoadingSpinner } from '../components/common/FeedLoadingSpinner'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { AllNewsListItem } from '../components/news/AllNewsListItem'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useAllNewsFeed } from '../hooks/useAllNewsFeed'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import styles from './NewsFeedPage.module.css'

export default function NewsFeedPage() {
  const { items, pagination, loading, loadingMore, error, loadMoreError, loadMore } = useAllNewsFeed()

  const newsSentinelRef = useInfiniteScroll({
    enabled: !loading && items.length > 0,
    hasMore: pagination.hasNext,
    loading: loadingMore,
    onLoadMore: loadMore,
  })

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(new Error(error)) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  const showSkeleton = loading && items.length === 0 && !error

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <PageFetchError title="전체 뉴스를 불러오지 못했어요" message={error} />
        ) : null}

        {showSkeleton ? (
          <div className={styles.skeletonList} aria-busy="true" aria-label="전체 뉴스 로딩">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={clsx(skeleton.block, styles.skeletonRow)} />
            ))}
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <EmptyState
            className={styles.empty}
            title="뉴스가 없어요"
            message="표시할 기사가 없습니다."
            hint="잠시 후 다시 확인해 보세요."
          />
        ) : null}

        {!loading && items.length > 0 ? (
          <section className={styles.feed} aria-label="뉴스 목록">
            <ul className={styles.list}>
              {items.map((item) => (
                <AllNewsListItem key={item.id} item={item} />
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
    </Layout>
  )
}
