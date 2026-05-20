import clsx from 'clsx'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import { StockDetailContent } from '../components/stock/StockDetailContent'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
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

  const contentMatchesRoute = data?.stock.code === normalizedCode

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(error) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <PageFetchError title="종목 정보를 불러오지 못했어요" message={error.message} />
        ) : null}

        {loading && !contentMatchesRoute && !error ? (
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
