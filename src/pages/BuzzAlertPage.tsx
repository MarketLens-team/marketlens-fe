import clsx from 'clsx'
import { BuzzSurgeSummaryCards } from '../components/buzz/BuzzSurgeSummaryCards'
import { BuzzSurgeTop10Table } from '../components/buzz/BuzzSurgeTop10Table'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useBuzzSurge } from '../hooks/useBuzzSurge'
import styles from './BuzzAlertPage.module.css'

export default function BuzzAlertPage() {
  const { data, loading, error } = useBuzzSurge()

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(error) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <PageFetchError title="언급량 급등 정보를 불러오지 못했어요" message={error.message} />
        ) : null}

        {loading && !data && !error ? (
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
