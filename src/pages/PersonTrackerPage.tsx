import clsx from 'clsx'
import { PersonFrequentStocksPanel } from '../components/person/PersonFrequentStocksPanel'
import { PersonStatementCard } from '../components/person/PersonStatementCard'
import { PersonTop5Panel } from '../components/person/PersonTop5Panel'
import { Layout } from '../components/common/Layout'
import skeleton from '../components/common/Skeleton.module.css'
import { usePersonTracker } from '../hooks/usePersonTracker'
import styles from './PersonTrackerPage.module.css'

export default function PersonTrackerPage() {
  const { data, loading, error, loadMoreMentions, loadingMoreMentions } = usePersonTracker()

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <p className={styles.bannerError} role="alert">
            {error.message}
          </p>
        ) : null}

        {loading && !data ? (
          <div className={styles.mainGrid} aria-busy="true" aria-label="인물 발언 로딩">
            <div className={styles.feedCol}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, styles.skeletonCard)} />
              ))}
            </div>
            <aside className={styles.asideCol}>
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
              {data.mentionsHasNext ? (
                <div className={styles.loadMoreWrap}>
                  <button
                    type="button"
                    className={styles.loadMoreBtn}
                    onClick={() => void loadMoreMentions()}
                    disabled={loadingMoreMentions}
                  >
                    {loadingMoreMentions ? '불러오는 중…' : '더 불러오기'}
                  </button>
                </div>
              ) : null}
            </div>
            <aside className={styles.asideCol}>
              <PersonTop5Panel items={data.topPersons} />
              <PersonFrequentStocksPanel items={data.frequentStocks} />
            </aside>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
