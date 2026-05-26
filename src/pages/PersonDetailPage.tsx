import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { usePersonStatementFocus } from '../hooks/usePersonStatementFocus'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { PageFabRail } from '../components/common/PageFabRail'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { PersonFrequentStocksPanel } from '../components/person/PersonFrequentStocksPanel'
import { PersonStatementCard } from '../components/person/PersonStatementCard'
import { PersonTop5Panel } from '../components/person/PersonTop5Panel'
import { formatPersonRole } from '../components/person/personDisplay'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { buildPersonTrackerPath } from '../lib/buildPersonRoute'
import { isPersonDetailPageLoading } from '../lib/personPageLoading'
import { EntityAvatar } from '../components/ui/EntityAvatar'
import { personProfileFromMention } from '../data/mappers/personMapper'
import type { PersonMentionsRange } from '../data/types/person'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { usePersonDetail } from '../hooks/usePersonDetail'
import { usePersonFrequentStocks } from '../hooks/usePersonFrequentStocks'
import { usePersonMentionCount } from '../hooks/usePersonMentionCount'
import { usePersonTopMentioned } from '../hooks/usePersonTopMentioned'
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
    loading: feedLoading,
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
    aroundError,
  } = usePersonDetail(personId ?? 0, PERSON_DETAIL_FEED_RANGE, focusStatementId)
  const {
    data: topPersons,
    loading: topLoading,
    refreshing: topRefreshing,
  } = usePersonTopMentioned(topRange)
  const {
    data: frequentStocks,
    loading: stocksLoading,
    refreshing: stocksRefreshing,
  } = usePersonFrequentStocks(stocksRange, personId ?? undefined)
  const {
    data: mentionCount,
    loading: mentionCountLoading,
    refreshing: mentionCountRefreshing,
  } = usePersonMentionCount(personId ?? 0, PERSON_DETAIL_FEED_RANGE)

  const profile = useMemo(() => {
    const first = feed?.mentions[0]
    return first ? personProfileFromMention(first) : null
  }, [feed?.mentions])

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

  const { isStatementFocused } = usePersonStatementFocus(feed?.mentions ?? [], {
    loading: feedInitialLoading || loadingAround,
  })

  const topSentinelRef = useInfiniteScroll({
    enabled:
      feedMode === 'anchored' &&
      Boolean(feed?.mentions.length) &&
      personId != null &&
      !loadingAround,
    hasMore: hasMoreUp,
    loading: loadingNewer,
    direction: 'up',
    onLoadMore: () => void loadNewer(),
  })

  const bottomSentinelRef = useInfiniteScroll({
    enabled: Boolean(feed?.mentions.length) && personId != null && !loadingAround,
    hasMore: hasMoreDown,
    loading: loadingMore,
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
            <div className={styles.detailLeftSticky}>
              <PersonTop5Panel
                items={topPersons ?? []}
                range={topRange}
                onRangeChange={setTopRange}
                loading={topLoading || topRefreshing}
              />
            </div>

            <div className={styles.detailFeedCol}>
              <div className={styles.profileTimeline}>
                <header
                  className={clsx(
                    styles.profileHeader,
                    (mentionCountLoading || mentionCountRefreshing) && styles.profileHeaderRefreshing,
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

                <div className={styles.feedBody}>
                  {aroundError ? (
                    <p className={styles.feedError} role="alert">
                      {aroundError}
                    </p>
                  ) : null}
                  <ul
                    className={clsx(
                      gridStyles.feedList,
                      (feedLoading || loadingAround) && styles.feedDimmed,
                    )}
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

                  {feed.mentions.length === 0 ? (
                    <p className={styles.empty}>오늘 표시할 발언이 없습니다</p>
                  ) : null}

                  {hasMoreDown ? (
                    <div ref={bottomSentinelRef} className={styles.infiniteSentinel} aria-hidden />
                  ) : null}
                </div>
              </div>
            </div>

            <aside className={styles.detailRightPanel}>
              <PersonFrequentStocksPanel
                items={frequentStocks ?? []}
                title="함께 언급된 종목"
                range={stocksRange}
                onRangeChange={setStocksRange}
                loading={stocksLoading || stocksRefreshing}
              />
            </aside>

            {pageReady ? <PageFabRail className={styles.fabRail} /> : null}
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
