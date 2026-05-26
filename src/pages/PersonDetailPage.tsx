import clsx from 'clsx'
import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { usePersonStatementFocus } from '../hooks/usePersonStatementFocus'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { PageFabRail } from '../components/common/PageFabRail'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { PersonStatementCard } from '../components/person/PersonStatementCard'
import { formatPersonRole } from '../components/person/personDisplay'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { buildPersonTrackerPath } from '../lib/buildPersonRoute'
import { isPersonDetailPageLoading } from '../lib/personPageLoading'
import { FeedLoadingSpinner } from '../components/common/FeedLoadingSpinner'
import { EntityAvatar } from '../components/ui/EntityAvatar'
import type { PersonMentionsRange } from '../data/types/person'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import {
  ANCHORED_SCROLL_PREFETCH_EDGE_PX,
  ANCHORED_SCROLL_PREFETCH_EDGE_UP_PX,
} from '../data/types/anchoredFeed'
import { usePersonDetail } from '../hooks/usePersonDetail'
import { usePersonFrequentStocks } from '../hooks/usePersonFrequentStocks'
import { usePersonMentionCount } from '../hooks/usePersonMentionCount'
import { usePersonTopMentioned } from '../hooks/usePersonTopMentioned'
import { useStablePersonProfile } from '../hooks/useStablePersonProfile'
import { PersonDetailLeftSidebar, PersonDetailRightSidebar } from './PersonDetailSidebars'
import gridStyles from './personPageLayout.module.css'
import styles from './PersonDetailPage.module.css'

const PERSON_DETAIL_FEED_RANGE = 'today' as const satisfies PersonMentionsRange

function parsePersonId(raw: string | undefined): number | null {
  if (!raw?.trim()) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function PersonDetailPage() {
  const { personId: personIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const focusStatementId = searchParams.get('statementId')?.trim() || null
  const personId = parsePersonId(personIdParam)
  const [topRange, setTopRange] = useState<PersonMentionsRange>('today')
  const [stocksRange, setStocksRange] = useState<PersonMentionsRange>('today')

  const {
    data: feed,
    isInitialLoading: feedInitialLoading,
    error: feedError,
    feedMode,
    hasMoreUp,
    hasMoreDown,
    loadingAround,
    loadingNewer,
    loadNewer,
    loadMore,
    loadingMore,
    loadMoreError,
    aroundError,
    anchoredWarmComplete,
  } = usePersonDetail(personId ?? 0, PERSON_DETAIL_FEED_RANGE, focusStatementId)
  const { data: topPersons, loading: topLoading } = usePersonTopMentioned(topRange)
  const { data: frequentStocks, loading: stocksLoading } = usePersonFrequentStocks(
    stocksRange,
    personId ?? undefined,
  )
  const { data: mentionCount, loading: mentionCountLoading } = usePersonMentionCount(
    personId ?? 0,
    PERSON_DETAIL_FEED_RANGE,
  )

  const profile = useStablePersonProfile(personId ?? 0, feed?.mentions)
  const topSidebarInitialLoading = topLoading && topPersons == null
  const stocksSidebarInitialLoading = stocksLoading && frequentStocks == null
  const profileMetaInitialLoading = mentionCountLoading && mentionCount == null

  const pageLoading = isPersonDetailPageLoading({
    feedError,
    feedInitialLoading,
    topLoading,
    topPersons,
    stocksLoading,
    frequentStocks,
    mentionCountLoading,
    mentionCount,
  })

  const pageReady = !pageLoading && feed != null

  const focusFeedReady = anchoredWarmComplete

  const { isStatementFocused } = usePersonStatementFocus(feed?.mentions ?? [], {
    loading: feedInitialLoading || !focusFeedReady,
  })

  const topSentinelMargin = `${ANCHORED_SCROLL_PREFETCH_EDGE_UP_PX}px 0px 0px 0px`

  const topSentinelRef = useInfiniteScroll({
    enabled: feedMode === 'anchored' && Boolean(feed?.mentions.length) && personId != null && focusFeedReady,
    hasMore: hasMoreUp,
    loading: loadingNewer,
    direction: 'up',
    rootMargin: topSentinelMargin,
    requireUserScrollUp: true,
    loadCooldownMs: 400,
    onLoadMore: () => void loadNewer(),
  })

  const bottomSentinelRef = useInfiniteScroll({
    enabled: Boolean(feed?.mentions.length) && personId != null && focusFeedReady,
    hasMore: hasMoreDown,
    loading: loadingMore,
    rootMargin: feedMode === 'anchored' ? `0px 0px ${ANCHORED_SCROLL_PREFETCH_EDGE_PX}px 0px` : undefined,
    onLoadMore: () => void loadMore(),
  })

  const httpFullscreenPreset = feedError ? fullscreenPresetFromAppError(feedError) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/person" />
  }

  if (personId == null) {
    return (
      <Layout>
        <PageFetchError
          title="잘못된 인물 경로예요"
          message="인물 ID가 올바르지 않습니다."
        />
      </Layout>
    )
  }

  const breadcrumbCurrentLabel = profile?.personName ?? (pageReady ? `인물 #${personId}` : '…')

  return (
    <Layout>
      <div className={styles.page} aria-busy={pageLoading || undefined}>
        {pageReady ? (
          <Breadcrumb
            className={styles.breadcrumb}
            items={[
              { label: '인물 발언', to: buildPersonTrackerPath() },
              { label: breadcrumbCurrentLabel, current: true },
            ]}
          />
        ) : null}

        {feedError ? (
          <PageFetchError title="인물 발언을 불러오지 못했어요" message={feedError.message} />
        ) : null}

        {pageReady ? (
          <div className={styles.detailGrid}>
            <PersonDetailLeftSidebar
              items={topPersons ?? []}
              range={topRange}
              onRangeChange={setTopRange}
              showInitialLoading={topSidebarInitialLoading}
            />

            <div className={styles.detailFeedCol}>
              <div className={styles.profileTimeline}>
                <div className={styles.profileBlock}>
                  <header
                    className={clsx(
                      styles.profileHeader,
                      profileMetaInitialLoading && styles.profileHeaderRefreshing,
                    )}
                  >
                    {profile ? (
                      <EntityAvatar
                        variant="person"
                        size="lg"
                        name={profile.personName}
                        imageUrl={profile.imageUrl}
                        className={styles.profileAvatar}
                      />
                    ) : null}
                    <div className={styles.profileText}>
                      <h1 className={styles.profileName}>{profile?.personName ?? `인물 #${personId}`}</h1>
                      {profile ? (
                        <p className={styles.profileRole}>
                          {formatPersonRole(profile.organizationName, profile.role)}
                        </p>
                      ) : null}
                      {mentionCount != null ? (
                        <p className={styles.profileMeta}>오늘 언급 {mentionCount}건</p>
                      ) : null}
                    </div>
                  </header>

                  {feedMode === 'anchored' && hasMoreUp && loadingNewer ? (
                    <div
                      className={styles.feedNewerSlot}
                      aria-busy="true"
                      aria-live="polite"
                    >
                      <FeedLoadingSpinner label="이전 발언 불러오는 중" />
                    </div>
                  ) : null}
                </div>

                <div
                  className={clsx(
                    styles.feedBody,
                    loadingAround && focusStatementId && styles.feedBodyAnchoring,
                  )}
                >
                  {aroundError ? (
                    <p className={styles.feedError} role="alert">
                      {aroundError}
                    </p>
                  ) : null}
                  {loadingAround && focusStatementId ? (
                    <div className={styles.feedAnchorSpinner} aria-busy="true">
                      <FeedLoadingSpinner />
                    </div>
                  ) : null}
                  {feed.mentions.length === 0 && loadingAround && focusStatementId ? (
                    <div className={styles.feedAroundLoading} aria-busy="true">
                      <FeedLoadingSpinner />
                    </div>
                  ) : (
                    <ul
                      className={clsx(
                        gridStyles.feedList,
                        feedInitialLoading && styles.feedDimmed,
                      )}
                      data-anchored-feed-list
                      aria-label={`${profile?.personName ?? '인물'} 발언 목록`}
                    >
                      {feedMode === 'anchored' && hasMoreUp ? (
                        <li className={styles.feedScrollHead} aria-hidden>
                          <div ref={topSentinelRef} className={styles.infiniteSentinel} />
                        </li>
                      ) : null}
                      {feed.mentions.map((mention) => (
                        <li
                          key={mention.id}
                          id={`person-statement-${mention.id}`}
                          data-scroll-anchor-item
                          className={gridStyles.timelineItemDetail}
                        >
                          <PersonStatementCard
                            mention={mention}
                            variant="detailFeed"
                            highlighted={isStatementFocused(mention.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}

                  {feed.mentions.length === 0 ? (
                    <p className={styles.empty}>오늘 표시할 발언이 없습니다</p>
                  ) : null}

                  {hasMoreDown ? (
                    <div className={styles.feedScrollFoot} aria-busy={loadingMore || undefined}>
                      <div ref={bottomSentinelRef} className={styles.infiniteSentinel} aria-hidden />
                      <div className={styles.feedLoadMoreSlot} aria-hidden={!loadingMore}>
                        {loadingMore ? <FeedLoadingSpinner label="발언 더 불러오는 중" /> : null}
                      </div>
                    </div>
                  ) : null}

                  {loadMoreError ? (
                    <p className={styles.feedError} role="alert">
                      {loadMoreError}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <PersonDetailRightSidebar
              items={frequentStocks ?? []}
              range={stocksRange}
              onRangeChange={setStocksRange}
              showInitialLoading={stocksSidebarInitialLoading}
            />

            <div className={gridStyles.fabRail} aria-hidden />
          </div>
        ) : null}

        {pageReady ? <PageFabRail alwaysVisible /> : null}
      </div>
    </Layout>
  )
}
