import clsx from 'clsx'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '../components/common/Layout'
import skeleton from '../components/common/Skeleton.module.css'
import { StockDetailContent } from '../components/stock/StockDetailContent'
import { getLayoutScrollRoot } from '../hooks/useInfiniteScroll'
import { useStockDetail } from '../hooks/useStockDetail'
import styles from './StockDetailPage.module.css'

export default function StockDetailPage() {
  const { stockCode } = useParams()
  const normalizedCode = stockCode?.trim() ?? ''
  const { data, loading, error } = useStockDetail(stockCode)

  useEffect(() => {
    getLayoutScrollRoot()?.scrollTo({ top: 0, left: 0 })
  }, [normalizedCode])

  const contentMatchesRoute =
    Boolean(data) && data.stock.code === normalizedCode

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <p className={styles.bannerError} role="alert">
            {error.message}
          </p>
        ) : null}

        {loading && !contentMatchesRoute ? (
          <div className={styles.skeleton} aria-busy="true" aria-label="종목 상세 로딩">
            <div className={clsx(skeleton.block, styles.skeletonHeader)} />
            <div className={styles.skeletonGrid}>
              <div className={clsx(skeleton.block, styles.skeletonPanel)} />
              <div className={clsx(skeleton.block, styles.skeletonPanel)} />
            </div>
          </div>
        ) : null}

        {contentMatchesRoute ? (
          <StockDetailContent key={data!.stock.code} data={data!} />
        ) : null}
      </div>
    </Layout>
  )
}
