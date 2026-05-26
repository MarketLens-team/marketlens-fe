import clsx from 'clsx'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { EmptyState } from '../components/common/EmptyState'
import { FeedLoadingSpinner } from '../components/common/FeedLoadingSpinner'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { PageHeader } from '../components/common/PageHeader'
import skeleton from '../components/common/Skeleton.module.css'
import { AllNewsListItem } from '../components/news/AllNewsListItem'
import { PillButton } from '../components/ui/PillButton'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useAllNewsFeed, type AllNewsSentimentFilter } from '../hooks/useAllNewsFeed'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import styles from './NewsFeedPage.module.css'

const FILTERS: { key: AllNewsSentimentFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'positive', label: '긍정' },
  { key: 'negative', label: '부정' },
]

export default function NewsFeedPage() {
  const {
    filter,
    setFilter,
    items,
    pagination,
    loading,
    loadingMore,
    error,
    loadMoreError,
    loadMore,
  } = useAllNewsFeed()

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
        <PageHeader
          title="전체 뉴스"
          description="시장 전반 뉴스를 감성 점수와 관련 종목 태그와 함께 확인합니다."
          actions={
            <div className={styles.filterGroup} role="group" aria-label="뉴스 감성 필터">
              {FILTERS.map(({ key, label }) => (
                <PillButton
                  key={key}
                  variant="secondary"
                  compact
                  active={filter === key}
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </PillButton>
              ))}
            </div>
          }
        />

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
            message="선택한 감성 필터에 맞는 기사가 없습니다."
            hint="전체 탭에서 다시 확인해 보세요."
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
