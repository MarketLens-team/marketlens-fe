import clsx from 'clsx'
import { useState } from 'react'
import { BackToTopButton } from '../components/common/BackToTopButton'
import { Layout } from '../components/common/Layout'
import skeleton from '../components/common/Skeleton.module.css'
import { PersonFrequentStocksPanel } from '../components/person/PersonFrequentStocksPanel'
import { PersonStatementCard } from '../components/person/PersonStatementCard'
import { PersonTop5Panel } from '../components/person/PersonTop5Panel'
import type { PersonMentionsRange } from '../data/types/person'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { usePersonTracker } from '../hooks/usePersonTracker'
import styles from './PersonTrackerPage.module.css'

const ASIDE_SCROLL_ROOT = '#person-tracker-aside-scroll'

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

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <section className={styles.errorPanel} role="alert">
            <h2 className={styles.errorTitle}>인물 발언을 불러오지 못했어요</h2>
            <p className={styles.errorMessage}>{error.message}</p>
          </section>
        ) : null}

        {loading && !data && !error ? (
          <div className={styles.mainGrid} aria-busy="true" aria-label="인물 발언 로딩">
            <div className={styles.feedCol}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, styles.skeletonCard)} />
              ))}
            </div>
            <aside className={styles.asideCol}>
              <div className={clsx(skeleton.block, styles.skeletonRange)} />
              <div className={clsx(skeleton.block, styles.skeletonAside)} />
              <div className={clsx(skeleton.block, styles.skeletonAside)} />
            </aside>
          </div>
        ) : null}

        {data ? (
          <div className={styles.mainGrid}>
            <div className={styles.feedCol}>
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
            </div>
            <aside className={styles.asideCol}>
              <div className={styles.rangeRow} role="group" aria-label="기간">
                <div className={styles.segmented}>
                  <button
                    type="button"
                    className={clsx(styles.segmentBtn, range === 'today' && styles.segmentBtnActive)}
                    aria-pressed={range === 'today'}
                    onClick={() => setRange('today')}
                  >
                    오늘
                  </button>
                  <button
                    type="button"
                    className={clsx(styles.segmentBtn, range === '7d' && styles.segmentBtnActive)}
                    aria-pressed={range === '7d'}
                    onClick={() => setRange('7d')}
                  >
                    7일
                  </button>
                </div>
              </div>
              <div id="person-tracker-aside-scroll" className={styles.asideScroll}>
                <PersonTop5Panel items={data.topPersons} />
                <PersonFrequentStocksPanel items={data.frequentStocks} />
              </div>
              <div className={styles.asideFooter}>
                <BackToTopButton
                  placement="inline"
                  tooltipSide="left"
                  scrollRootSelector={ASIDE_SCROLL_ROOT}
                />
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
