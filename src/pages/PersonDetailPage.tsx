import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import styles from './PersonDetailPage.module.css'

const FEED_SCROLL_ROOT = '#person-detail-feed-scroll'

function parsePersonId(raw: string | undefined): number | null {
  if (!raw?.trim()) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

function RangeToggle({
  range,
  onChange,
  className,
}: {
  range: PersonMentionsRange
  onChange: (range: PersonMentionsRange) => void
  className?: string
}) {
  return (
    <div className={clsx(styles.segmented, className)} role="group" aria-label="기간">
      <button
        type="button"
        className={clsx(styles.segmentBtn, range === 'today' && styles.segmentBtnActive)}
        aria-pressed={range === 'today'}
        onClick={() => onChange('today')}
      >
        오늘
      </button>
      <button
        type="button"
        className={clsx(styles.segmentBtn, range === '7d' && styles.segmentBtnActive)}
        aria-pressed={range === '7d'}
        onClick={() => onChange('7d')}
      >
        7일
      </button>
    </div>
  )
}

export default function PersonDetailPage() {
  const navigate = useNavigate()
  const { personId: personIdParam } = useParams()
  const personId = parsePersonId(personIdParam)
  const [range, setRange] = useState<PersonMentionsRange>('today')
  const { data, loading, error, loadMore, loadingMore } = usePersonDetail(personId ?? 0, range)

  const profile = useMemo(() => {
    const first = data?.mentions[0]
    return first ? personProfileFromMention(first) : null
  }, [data?.mentions])

  const infiniteEnabled = Boolean(data?.mentionsHasNext)
  const sentinelRef = useInfiniteScroll({
    enabled: infiniteEnabled && personId != null,
    hasMore: Boolean(data?.mentionsHasNext),
    loading: loadingMore,
    onLoadMore: () => void loadMore(),
  })

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(error) : null
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

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <IconCircleButton
            direction="back"
            aria-label="인물 발언 목록으로"
            onClick={() => navigate('/person')}
          />
          <RangeToggle range={range} onChange={setRange} />
        </div>

        {error ? (
          <PageFetchError title="인물 발언을 불러오지 못했어요" message={error.message} />
        ) : null}

        {loading && !data && !error ? (
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

        {data ? (
          <div className={styles.mainGrid}>
            <aside className={styles.leftAside}>
              <PersonTop5Panel items={data.topPersons} />
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
                      <p className={styles.heroMeta}>
                        {range === 'today' ? '오늘' : '최근 7일'} 발언 {data.mentions.length}건
                        {data.mentionsHasNext ? '+' : ''}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className={styles.heroText}>
                    <h1 className={styles.heroName}>인물 #{personId}</h1>
                    <p className={styles.heroMeta}>이 기간에 표시할 발언이 없습니다</p>
                  </div>
                )}
              </header>

              <ul className={styles.feedList}>
                {data.mentions.map((mention) => (
                  <li key={mention.id}>
                    <PersonStatementCard mention={mention} variant="feed" />
                  </li>
                ))}
              </ul>

              {data.mentions.length === 0 ? (
                <p className={styles.empty}>이 기간에 표시할 발언이 없습니다</p>
              ) : null}

              {infiniteEnabled ? <div ref={sentinelRef} className={styles.infiniteSentinel} aria-hidden /> : null}

              <div className={styles.feedFooter}>
                <BackToTopButton
                  placement="inline"
                  scrollRootSelector={FEED_SCROLL_ROOT}
                />
              </div>
            </div>

            <aside className={styles.rightAside}>
              <PersonFrequentStocksPanel
                items={data.frequentStocks}
                title="함께 언급된 종목"
              />
            </aside>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
