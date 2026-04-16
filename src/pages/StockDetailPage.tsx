import clsx from 'clsx'
import { useParams } from 'react-router-dom'
import { CardSectionHeader } from '../components/common/CardSectionHeader'
import { Card } from '../components/common/Card'
import { DetailSplitShell, type DetailAccordionSidebarGroup } from '../components/common/DetailSplitShell'
import { Layout } from '../components/common/Layout'
import { PageHeader } from '../components/common/PageHeader'
import skeleton from '../components/common/Skeleton.module.css'
import { useStockDetail } from '../hooks/useStockDetail'
import styles from './StockDetailPage.module.css'

function sentimentClass(s: 'positive' | 'negative' | 'neutral') {
  if (s === 'positive') return styles.sentPos
  if (s === 'negative') return styles.sentNeg
  return styles.sentNeu
}

type StockSidebarKey = 'overview' | 'analysis' | 'news'

const stockSidebarGroups: DetailAccordionSidebarGroup<StockSidebarKey>[] = [
  {
    key: 'overview',
    section: '개요',
    icon: '📈',
    items: [
      { id: 'stock-summary', label: '종목 요약' },
      { id: 'stock-snapshot', label: '감성 스냅샷' },
    ],
  },
  {
    key: 'analysis',
    section: '분석',
    icon: '🧠',
    items: [
      { id: 'stock-timeline', label: '타임라인' },
      { id: 'stock-related', label: '연관 인물/섹터' },
    ],
  },
  {
    key: 'news',
    section: '뉴스',
    icon: '📰',
    items: [{ id: 'stock-news', label: '최근 뉴스' }],
  },
]

export default function StockDetailPage() {
  const { stockCode } = useParams()
  const { data, loading, error } = useStockDetail(stockCode)

  return (
    <Layout hideSidebar>
      <DetailSplitShell groups={stockSidebarGroups}>
        <div className={styles.page}>
          <PageHeader
            title={data?.stock.name ?? (stockCode ? `종목 ${stockCode}` : '종목 상세')}
            description="뉴스 감성·버즈·관련 인물을 종목 단위로 봅니다. 상세 데이터는 stockClient → GET /api/v1/stocks/{code} 에 매핑합니다."
          />
          {error ? (
            <p className={styles.bannerError} role="alert">
              {error.message}
            </p>
          ) : null}
          {loading && !data ? (
            <div className={styles.grid} aria-busy="true" aria-label="종목 상세 로딩">
              <Card padding="none" className={styles.feedCard}>
                <CardSectionHeader title="요약" subtitle="코드 · 감성 · 24h 버즈" />
                <div className={styles.skeletonPad}>
                  <div className={clsx(skeleton.block, skeleton.stat)} />
                </div>
              </Card>
              <Card padding="none" className={styles.feedCard}>
                <CardSectionHeader title="최근 뉴스" subtitle="출처 · 시각 · 감성 극성" />
                <div className={styles.skeletonList}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={clsx(skeleton.block, skeleton.rowMd)} />
                  ))}
                </div>
              </Card>
            </div>
          ) : null}
          {data ? (
            <div className={styles.grid}>
              <Card padding="none" className={styles.feedCard}>
                <CardSectionHeader title="요약" subtitle="코드 · 감성 · 24h 버즈" />
                <div className={styles.cardBody}>
                  <dl className={styles.dl}>
                    <div>
                      <dt>종목코드</dt>
                      <dd>{data.stock.code}</dd>
                    </div>
                    <div>
                      <dt>감성 스코어</dt>
                      <dd className={data.stock.sentimentScore >= 0 ? styles.scoreUp : styles.scoreDown}>
                        {data.stock.sentimentScore > 0 ? '+' : ''}
                        {data.stock.sentimentScore}
                      </dd>
                    </div>
                    <div>
                      <dt>24h 버즈</dt>
                      <dd>{data.stock.buzz24h}</dd>
                    </div>
                  </dl>
                </div>
              </Card>
              <Card padding="none" className={styles.feedCard}>
                <CardSectionHeader title="최근 뉴스" subtitle="출처 · 시각 · 감성 극성" />
                {data.recentNews.length === 0 ? (
                  <p className={skeleton.empty}>최근 뉴스가 없습니다</p>
                ) : (
                  <ul className={styles.newsList}>
                    {data.recentNews.map((n) => (
                      <li key={n.id} className={styles.newsItem}>
                        <div className={styles.newsTop}>
                          <span className={sentimentClass(n.sentiment)}>{n.sentiment}</span>
                          <span className={styles.newsMeta}>
                            {n.source} · {new Date(n.publishedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className={styles.newsTitle}>{n.title}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          ) : null}
        </div>
      </DetailSplitShell>
    </Layout>
  )
}
