import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { PageLoading } from '../components/common/pageLoading/PageLoading'
import { StockDetailContent } from '../components/stock/StockDetailContent'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { getLayoutScrollRoot } from '../hooks/useInfiniteScroll'
import { useStockDetail } from '../hooks/useStockDetail'
import styles from './StockDetailPage.module.css'

export default function StockDetailPage() {
  const { stockCode } = useParams()
  const [searchParams] = useSearchParams()
  const normalizedCode = stockCode?.trim() ?? ''
  const focusNewsId = searchParams.get('newsId')?.trim() || null
  const scrollToFocusNews = searchParams.get('scrollToNews') !== '0'
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
          <PageLoading variant="stockDetail" />
        ) : null}

        {contentMatchesRoute ? (
          <StockDetailContent
            key={data!.stock.code}
            data={data!}
            focusNewsId={focusNewsId}
            scrollToFocusNews={scrollToFocusNews}
          />
        ) : null}
      </div>
    </Layout>
  )
}
