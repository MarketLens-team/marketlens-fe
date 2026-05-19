import clsx from 'clsx'
import { useParams } from 'react-router-dom'
import { Layout } from '../components/common/Layout'
import skeleton from '../components/common/Skeleton.module.css'
import { StockDetailContent } from '../components/stock/StockDetailContent'
import { useStockDetail } from '../hooks/useStockDetail'
import styles from './StockDetailPage.module.css'

export default function StockDetailPage() {
  const { stockCode } = useParams()
  const { data, loading, error } = useStockDetail(stockCode)

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <p className={styles.bannerError} role="alert">
            {error.message}
          </p>
        ) : null}

        {loading && !data ? (
          <div className={styles.skeleton} aria-busy="true" aria-label="종목 상세 로딩">
            <div className={clsx(skeleton.block, styles.skeletonHeader)} />
            <div className={styles.skeletonSummary}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={clsx(skeleton.block, styles.skeletonCard)} />
              ))}
            </div>
            <div className={styles.skeletonGrid}>
              <div className={clsx(skeleton.block, styles.skeletonPanel)} />
              <div className={clsx(skeleton.block, styles.skeletonPanel)} />
            </div>
          </div>
        ) : null}

        {data ? <StockDetailContent data={data} /> : null}
      </div>
    </Layout>
  )
}
