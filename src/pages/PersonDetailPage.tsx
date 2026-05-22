import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { BackToTopButton } from '../components/common/BackToTopButton'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { PersonFrequentStocksPanel } from '../components/person/PersonFrequentStocksPanel'
import { PersonPanelRangeToggle } from '../components/person/PersonPanelRangeToggle'
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
  const [feedRange, setFeedRange] = useState<PersonMentionsRange>('today')
  const [topRange, setTopRange] = useState<PersonMentionsRange>('today')
  const [stocksRange, setStocksRange] = useState<PersonMentionsRange>('today')

  const {
    data: feed,
    loading: feedLoading,
    isInitialLoading: feedInitialLoading,
    error: feedError,
    loadMore,
    loadingMore,
  } = usePersonDetail(
    personId ?? 0,
    feedRange,
  )
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
  } = usePersonMentionCount(personId ?? 0, feedRange)

  const profile = useMemo(() => {
    const first = feed?.mentions[0]
    return first ? personProfileFromMention(first) : null
  }, [feed?.mentions])

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
            <div className={clsx(styles.detailFeedCol, styles.feedColDetail)}>
              <div className={clsx(skeleton.block, styles.skeletonHero)} />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, styles.skeletonCard)} />
              ))}
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

            <div className={clsx(styles.detailFeedCol, styles.feedColDetail)}>
              <header
                className={clsx(
                  styles.hero,
                  (mentionCountLoading || mentionCountRefreshing) && styles.heroRefreshing,
                )}
              >
                <PersonPanelRangeToggle
                  range={feedRange}
                  onChange={setFeedRange}
                  aria-label="발언 기간"
                  className={styles.heroRangeToggle}
                />
                {profile ? (
                  <div className={styles.heroMain}>
                    <EntityAvatar
                      variant="person"
                      size="lg"
                      name={profile.personName}
                      imageUrl={profile.imageUrl}
                    />
                    <div className={styles.heroText}>
                      <h1 className={styles.heroName}>{profile.personName}</h1>
                      <p className={styles.heroRole}>
                        {formatPersonRole(profile.organizationName, profile.role)}
                      </p>
                      {mentionCount != null ? (
                        <p className={styles.heroMeta}>
                          {feedRange === 'today' ? '오늘' : '최근 7일'} 언급 {mentionCount}건
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className={styles.heroText}>
                    <h1 className={styles.heroName}>인물 #{personId}</h1>
                    {mentionCount != null ? (
                      <p className={styles.heroMeta}>
                        {feedRange === 'today' ? '오늘' : '최근 7일'} 언급 {mentionCount}건
                      </p>
                    ) : null}
                  </div>
                )}
              </header>

              <ul className={clsx(gridStyles.feedList, styles.feedList, feedLoading && styles.feedDimmed)}>
                {feed.mentions.map((mention) => (
                  <li key={mention.id}>
                    <PersonStatementCard mention={mention} variant="feed" />
                  </li>
                ))}
              </ul>

              {feed.mentions.length === 0 ? (
                <p className={styles.empty}>이 기간에 표시할 발언이 없습니다</p>
              ) : null}

              {infiniteEnabled ? <div ref={sentinelRef} className={styles.infiniteSentinel} aria-hidden /> : null}

              <div className={styles.feedFooter}>
                <BackToTopButton placement="inline" />
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
      </div>
    </Layout>
  )
}
