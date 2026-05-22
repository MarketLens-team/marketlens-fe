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
import styles from './PersonDetailPage.module.css'

const FEED_SCROLL_ROOT = '#person-detail-feed-scroll'

function parsePersonId(raw: string | undefined): number | null {
  if (!raw?.trim()) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function PersonDetailPage() {
  const navigate = useNavigate()
  const { personId: personIdParam } = useParams()
  const personId = parsePersonId(personIdParam)
  const [feedRange, setFeedRange] = useState<PersonMentionsRange>('today')
  const [topRange, setTopRange] = useState<PersonMentionsRange>('today')
  const [stocksRange, setStocksRange] = useState<PersonMentionsRange>('today')

  const { data: feed, loading: feedLoading, error: feedError, loadMore, loadingMore } = usePersonDetail(
    personId ?? 0,
    feedRange,
  )
  const { data: topPersons, loading: topLoading } = usePersonTopMentioned(topRange)
  const { data: frequentStocks, loading: stocksLoading } = usePersonFrequentStocks(
    stocksRange,
    personId ?? undefined,
  )
  const { data: mentionCount } = usePersonMentionCount(personId ?? 0, feedRange)

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

  const showInitialSkeleton = feedLoading && !feed && !feedError

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <IconCircleButton
            direction="back"
            aria-label="인물 발언 목록으로"
            onClick={() => navigate('/person')}
          />
        </div>

        {feedError ? (
          <PageFetchError title="인물 발언을 불러오지 못했어요" message={feedError.message} />
        ) : null}

        {showInitialSkeleton ? (
          <div className={styles.mainGrid} aria-busy="true" aria-label="인물 발언 로딩">
            <aside className={styles.leftAside}>
              <div className={clsx(skeleton.block, styles.skeletonAside)} />
            </aside>
            <div className={styles.feedCol}>
              <div className={clsx(skeleton.block, styles.skeletonHero)} />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, styles.skeletonCard)} />
              ))}
            </div>
            <aside className={styles.rightAside}>
              <div className={clsx(skeleton.block, styles.skeletonAside)} />
            </aside>
          </div>
        ) : null}

        {feed ? (
          <div className={styles.mainGrid}>
            <aside className={styles.leftAside}>
              <PersonTop5Panel
                items={topPersons ?? []}
                range={topRange}
                onRangeChange={setTopRange}
                loading={topLoading}
              />
            </aside>

            <div id="person-detail-feed-scroll" className={styles.feedCol}>
              <header className={styles.hero}>
                {profile ? (
                  <>
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
                  </>
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

              <div className={styles.feedHead}>
                <h2 className={styles.feedTitle}>발언</h2>
                <PersonPanelRangeToggle range={feedRange} onChange={setFeedRange} aria-label="발언 기간" />
              </div>

              <ul className={clsx(styles.feedList, feedLoading && styles.feedDimmed)}>
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
                <BackToTopButton placement="inline" scrollRootSelector={FEED_SCROLL_ROOT} />
              </div>
            </div>

            <aside className={styles.rightAside}>
              <PersonFrequentStocksPanel
                items={frequentStocks ?? []}
                title="함께 언급된 종목"
                range={stocksRange}
                onRangeChange={setStocksRange}
                loading={stocksLoading}
              />
            </aside>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
