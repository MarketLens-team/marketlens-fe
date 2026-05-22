import clsx from 'clsx'
import { useState } from 'react'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { BackToTopButton } from '../components/common/BackToTopButton'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { PersonFrequentStocksPanel } from '../components/person/PersonFrequentStocksPanel'
import { PersonStatementCard } from '../components/person/PersonStatementCard'
import { PersonTop5Panel } from '../components/person/PersonTop5Panel'
import type { PersonMentionsRange } from '../data/types/person'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { usePersonTracker } from '../hooks/usePersonTracker'
import styles from './PersonTrackerPage.module.css'

const FEED_SCROLL_ROOT = '#person-tracker-feed-scroll'

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

export default function PersonTrackerPage() {
  const [range, setRange] = useState<PersonMentionsRange>('today')
  const { data, loading, error, loadMoreMentions, loadingMoreMentions } = usePersonTracker(range)

  const infiniteEnabled = Boolean(data?.mentionsHasNext)
  const sentinelRef = useInfiniteScroll({
    enabled: infiniteEnabled,
    hasMore: Boolean(data?.mentionsHasNext),
    loading: loadingMoreMentions,
    onLoadMore: () => void loadMoreMentions(),
  })

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(error) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <h1 className={styles.pageTitle}>인물 발언</h1>
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
              {Array.from({ length: 4 }).map((_, i) => (
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

            <div id="person-tracker-feed-scroll" className={styles.feedCol}>
              <ul className={styles.feedList}>
                {data.mentions.map((mention) => (
                  <li key={mention.id}>
                    <PersonStatementCard mention={mention} />
                  </li>
                ))}
              </ul>
              {data.mentions.length === 0 ? (
                <p className={styles.empty}>표시할 인물 발언이 없습니다</p>
              ) : null}
              {infiniteEnabled ? <div ref={sentinelRef} className={styles.infiniteSentinel} aria-hidden /> : null}
              <div className={styles.feedFooter}>
                <BackToTopButton placement="inline" scrollRootSelector={FEED_SCROLL_ROOT} />
              </div>
            </div>

            <aside className={styles.rightAside}>
              <PersonFrequentStocksPanel items={data.frequentStocks} />
            </aside>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
