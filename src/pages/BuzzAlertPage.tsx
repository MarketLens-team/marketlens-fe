import clsx from 'clsx'
import { BuzzSurgeSummaryCards } from '../components/buzz/BuzzSurgeSummaryCards'
import { BuzzSurgeTop10Table } from '../components/buzz/BuzzSurgeTop10Table'
import { Layout } from '../components/common/Layout'
import skeleton from '../components/common/Skeleton.module.css'
import { useBuzzSurge } from '../hooks/useBuzzSurge'
import styles from './BuzzAlertPage.module.css'

export default function BuzzAlertPage() {
  const { data, loading, error } = useBuzzSurge()

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <p className={styles.bannerError} role="alert">
            {error.message}
          </p>
        ) : null}

        {loading && !data ? (
          <div className={styles.mainGrid} aria-busy="true" aria-label="언급량 급등 로딩">
            <div className={styles.summaryCol}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, styles.skeletonCard)} />
              ))}
            </div>
            <div className={clsx(skeleton.block, styles.skeletonTable)} />
          </div>
        ) : null}

        {data ? (
          <div className={styles.mainGrid}>
            <div className={styles.summaryCol}>
              <BuzzSurgeSummaryCards summary={data.summary} />
            </div>
            <div className={styles.tableCol}>
              <BuzzSurgeTop10Table items={data.items} />
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
