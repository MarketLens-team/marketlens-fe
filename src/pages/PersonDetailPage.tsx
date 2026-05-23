import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePersonStatementFocus } from '../hooks/usePersonStatementFocus'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { BackToTopButton } from '../components/common/BackToTopButton'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { PersonFrequentStocksPanel } from '../components/person/PersonFrequentStocksPanel'
import { PersonStatementCard } from '../components/person/PersonStatementCard'
import { PersonTop5Panel } from '../components/person/PersonTop5Panel'
import { formatPersonRole } from '../components/person/personDisplay'
import { IconCircleButton } from '../components/ui/IconCircleButton'
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

function PersonTimelineBackButton({ onBack }: { onBack: () => void }) {
  return (
    <div className={styles.asideBackBtn}>
      <div className={styles.toolbarBtnWrap}>
        <IconCircleButton
          direction="back"
          aria-label="전체 인물 타임라인으로 이동"
          onClick={onBack}
        />
        <span className={styles.toolbarTooltip} role="tooltip">
          전체 인물 타임라인으로 이동
        </span>
      </div>
    </div>
  )
}

export default function PersonDetailPage() {
  const navigate = useNavigate()
  const { personId: personIdParam } = useParams()
  const personId = parsePersonId(personIdParam)
  const [topRange, setTopRange] = useState<PersonMentionsRange>('today')
  const [stocksRange, setStocksRange] = useState<PersonMentionsRange>('today')

  const {
    data: feed,
    loading: feedLoading,
    isInitialLoading: feedInitialLoading,
    error: feedError,
    loadMore,
    loadingMore,
  } = usePersonDetail(personId ?? 0, PERSON_DETAIL_FEED_RANGE)
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

  const { isStatementFocused } = usePersonStatementFocus(feed?.mentions ?? [], {
    loading: feedInitialLoading,
    hasMore: Boolean(feed?.mentionsHasNext),
    loadingMore,
    onLoadMore: () => void loadMore(),
  })

  const infiniteEnabled = Boolean(feed?.mentionsHasNext)
  const sentinelRef = useInfiniteScroll({
    enabled: infiniteEnabled && personId != null,
    hasMore: Boolean(feed?.mentionsHasNext),
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

  const showInitialSkeleton = feedInitialLoading && !feedError

  return (
    <Layout>
      <div className={styles.page}>
        {feedError ? (
          <PageFetchError title="인물 발언을 불러오지 못했어요" message={feedError.message} />
        ) : null}

        {showInitialSkeleton ? (
          <div className={styles.detailGrid} aria-busy="true" aria-label="인물 발언 로딩">
            <div className={styles.detailLeftSticky}>
              <PersonTimelineBackButton onBack={() => navigate('/person')} />
              <div className={clsx(skeleton.block, styles.skeletonAside)} />
            </div>
            <div className={styles.detailFeedCol}>
              <div className={styles.profileTimeline}>
              <div className={clsx(skeleton.block, styles.skeletonProfile)} />
              <div className={styles.feedBody}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={clsx(skeleton.block, styles.skeletonCard)} />
                ))}
              </div>
              </div>
            </div>
            <aside className={styles.detailRightPanel}>
              <div className={clsx(skeleton.block, styles.skeletonAside)} />
            </aside>
          </div>
        ) : null}

        {feed ? (
          <div className={styles.detailGrid}>
            <div className={styles.detailLeftSticky}>
              <PersonTimelineBackButton onBack={() => navigate('/person')} />
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
                <ul
                  className={clsx(gridStyles.feedList, feedLoading && styles.feedDimmed)}
                  aria-label={`${profile?.personName ?? '인물'} 발언 목록`}
                >
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

                {infiniteEnabled ? (
                  <div ref={sentinelRef} className={styles.infiniteSentinel} aria-hidden />
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
          </div>
        ) : null}

        {feed ? <BackToTopButton placement="fixed" tooltipSide="left" /> : null}
      </div>
    </Layout>
  )
}
